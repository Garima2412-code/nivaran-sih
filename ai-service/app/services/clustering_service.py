"""
Issue clustering.

Extends duplicate detection (pairwise similarity) into group-level
clustering: complaints whose pairwise similarity clears the configured
threshold are merged into the same cluster via a union-find over the
similarity graph (i.e. connected components at that threshold) — not
exact string matching, and not a single fixed "representative" comparison.

Reuses `duplicate_detector.get_similarity_matrix`, which already handles
the sentence-transformers / TF-IDF fallback decision, so the similarity
engine is defined in exactly one place.
"""

import logging
from typing import Dict, List, Optional

from app.config import settings
from app.schemas.grievance import Cluster, ClusterComplaintInput, ClusterResponse
from app.services.duplicate_detector import get_similarity_matrix
from app.services.grievance_analyzer import _extract_location, _fallback_classify

logger = logging.getLogger("jansahay.cluster")


class _UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[rb] = ra


def cluster_complaints(
    complaints: List[ClusterComplaintInput],
    similarity_threshold: Optional[float] = None,
) -> ClusterResponse:
    n = len(complaints)
    if n == 0:
        return ClusterResponse(clusters=[], unclustered_ids=[], engine_used="none")

    if n == 1:
        return ClusterResponse(
            clusters=[], unclustered_ids=[complaints[0].id], engine_used="none"
        )

    texts = [c.text for c in complaints]
    ids = [c.id for c in complaints]

    matrix, engine = get_similarity_matrix(texts)

    threshold = similarity_threshold
    if threshold is None:
        threshold = (
            settings.CLUSTER_SIMILARITY_THRESHOLD_TFIDF
            if engine == "tfidf-fallback"
            else settings.CLUSTER_SIMILARITY_THRESHOLD
        )

    uf = _UnionFind(n)
    for i in range(n):
        for j in range(i + 1, n):
            if float(matrix[i][j]) >= threshold:
                uf.union(i, j)

    groups: Dict[int, List[int]] = {}
    for idx in range(n):
        root = uf.find(idx)
        groups.setdefault(root, []).append(idx)

    clusters: List[Cluster] = []
    unclustered_ids: List[str] = []
    cluster_counter = 1

    for member_indices in groups.values():
        if len(member_indices) < 2:
            unclustered_ids.append(ids[member_indices[0]])
            continue

        # Representative = the member with the highest average similarity
        # to the rest of the cluster (most "central" complaint).
        best_rep = member_indices[0]
        best_avg = -1.0
        pairwise_scores: Dict[str, float] = {}
        for i in member_indices:
            sims_to_others = [
                float(matrix[i][j]) for j in member_indices if j != i
            ]
            avg_sim = sum(sims_to_others) / len(sims_to_others)
            pairwise_scores[ids[i]] = round(avg_sim, 4)
            if avg_sim > best_avg:
                best_avg = avg_sim
                best_rep = i

        rep_text = texts[best_rep]
        fallback = _fallback_classify(rep_text)
        location = _extract_location(rep_text)

        clusters.append(
            Cluster(
                cluster_id=f"CLUSTER-{cluster_counter:03d}",
                grievance_ids=[ids[i] for i in member_indices],
                similarity_scores=pairwise_scores,
                common_issue_summary=fallback["summary"],
                category=fallback["department"],
                location=location,
            )
        )
        cluster_counter += 1

    return ClusterResponse(
        clusters=clusters, unclustered_ids=unclustered_ids, engine_used=engine
    )
