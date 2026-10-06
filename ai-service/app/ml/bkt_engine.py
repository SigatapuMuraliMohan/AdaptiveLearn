"""
Bayesian Knowledge Tracing (BKT) Engine for True Mastery Tracking
Implements Khan Academy / Duolingo standard latent knowledge state estimation.
"""

from typing import Dict, Any, List

# Standard Khan Academy / Corbett & Anderson BKT baseline parameters
DEFAULT_BKT_PARAMS = {
    "p_l0": 0.15,   # Prior probability student already knows the concept
    "p_t": 0.25,    # Transition probability (learning from reading lesson/practice)
    "p_g": 0.20,    # Guess probability (answering right without knowledge)
    "p_s": 0.10     # Slip probability (silly error despite knowing concept)
}

class BayesianKnowledgeTracer:
    def __init__(self, params: Dict[str, float] = None):
        self.params = params or DEFAULT_BKT_PARAMS

    def update_mastery(self,
                       current_p_l: float,
                       is_correct: bool,
                       custom_params: Dict[str, float] = None) -> Dict[str, Any]:
        """
        Updates latent concept mastery P(L_t) given an observed quiz response.
        """
        p = custom_params or self.params
        p_l_prev = max(0.01, min(0.99, float(current_p_l)))
        p_s = p.get("p_s", DEFAULT_BKT_PARAMS["p_s"])
        p_g = p.get("p_g", DEFAULT_BKT_PARAMS["p_g"])
        p_t = p.get("p_t", DEFAULT_BKT_PARAMS["p_t"])

        if is_correct:
            # P(L_t | Correct) = (P(L_{t-1}) * (1 - P(S))) / [P(L_{t-1}) * (1 - P(S)) + (1 - P(L_{t-1})) * P(G)]
            numerator = p_l_prev * (1.0 - p_s)
            denominator = numerator + (1.0 - p_l_prev) * p_g
            p_l_evidence = numerator / denominator
        else:
            # P(L_t | Incorrect) = (P(L_{t-1}) * P(S)) / [P(L_{t-1}) * P(S) + (1 - P(L_{t-1})) * (1 - P(G))]
            numerator = p_l_prev * p_s
            denominator = numerator + (1.0 - p_l_prev) * (1.0 - p_g)
            p_l_evidence = numerator / denominator

        # Knowledge transition after interaction: P(L_{t+1}) = P(L_t | Obs) + (1 - P(L_t | Obs)) * P(T)
        p_l_next = p_l_evidence + (1.0 - p_l_evidence) * p_t
        p_l_next = max(0.01, min(0.99, p_l_next))

        # Categorize mastery state
        mastery_pct = round(p_l_next * 100, 1)
        if p_l_next >= 0.85:
            status = "MASTERED"
            badge = "Verified Concept Mastery"
            badge_color = "emerald"
        elif p_l_next >= 0.50:
            status = "ACQUIRING"
            badge = "Competency Developing"
            badge_color = "amber"
        else:
            status = "NEEDS_REMEDIATION"
            badge = "Targeted Remediation Required"
            badge_color = "rose"

        return {
            "p_l_previous": round(p_l_prev, 4),
            "p_l_evidence": round(p_l_evidence, 4),
            "p_l_posterior": round(p_l_next, 4),
            "mastery_percentage": mastery_pct,
            "status": status,
            "badge": badge,
            "badge_color": badge_color,
            "observed_response": "CORRECT" if is_correct else "INCORRECT",
            "parameters_used": {
                "P(L0)": p.get("p_l0", DEFAULT_BKT_PARAMS["p_l0"]),
                "P(Transition)": p_t,
                "P(Guess)": p_g,
                "P(Slip)": p_s
            }
        }

    def trace_sequence(self,
                       responses: List[bool],
                       initial_p_l: float = None) -> List[Dict[str, Any]]:
        """
        Traces a multi-question sequence of responses and tracks the progression trajectory.
        """
        p_l = initial_p_l or self.params.get("p_l0", 0.15)
        history = []
        for i, is_correct in enumerate(responses):
            step = self.update_mastery(p_l, is_correct)
            step["step_number"] = i + 1
            history.append(step)
            p_l = step["p_l_posterior"]
        return history

bkt_engine = BayesianKnowledgeTracer()
