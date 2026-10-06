"""
Computerized Adaptive Testing (CAT) Engine via Item Response Theory (IRT)
Implements 2-Parameter Logistic (2PL) psychometric ability calibration with Dynamic Item Selection.
"""

import math
from typing import Dict, Any, List, Optional

class ComputerizedAdaptiveTestingEngine:
    def __init__(self):
        # Default discrimination parameter (a = 1.2 is standard for well-calibrated MCQs)
        self.default_discrimination = 1.2
        # Precision stopping criterion
        self.target_se = 0.30
        self.max_questions = 6
        self.min_questions = 3

    def probability_correct(self, theta: float, difficulty: float, discrimination: float = 1.2) -> float:
        """2PL IRT Probability function: P(θ) = 1 / (1 + exp(-a * (θ - b)))"""
        exponent = -discrimination * (theta - difficulty)
        # Numerical stability clamp
        exponent = max(-15.0, min(15.0, exponent))
        return 1.0 / (1.0 + math.exp(exponent))

    def fisher_information(self, theta: float, difficulty: float, discrimination: float = 1.2) -> float:
        """Fisher Information: I(θ) = a^2 * P(θ) * (1 - P(θ))"""
        p = self.probability_correct(theta, difficulty, discrimination)
        return (discrimination ** 2) * p * (1.0 - p)

    def update_ability_estimate(self,
                                responses: List[Dict[str, Any]],
                                current_theta: float = 0.0) -> Dict[str, Any]:
        """
        Estimates latent ability θ and standard error SE(θ) using Newton-Raphson Maximum Likelihood.
        """
        if not responses:
            return {
                "theta": 0.0,
                "standard_error": 1.0,
                "is_calibrated": False,
                "percentile": 50.0,
                "proficiency_level": "INTERMEDIATE"
            }

        theta = current_theta
        # Newton-Raphson iterative MLE
        for _ in range(12):
            score_func = 0.0
            total_info = 0.0
            for item in responses:
                b = float(item.get("difficulty", 0.0))
                a = float(item.get("discrimination", self.default_discrimination))
                is_correct = 1.0 if item.get("is_correct", False) else 0.0
                p = self.probability_correct(theta, b, a)

                # Derivative of log-likelihood
                score_func += a * (is_correct - p)
                total_info += (a ** 2) * p * (1.0 - p)

            # Prevent division by zero
            if total_info < 1e-4:
                break
            delta = score_func / total_info
            theta += delta
            # Clamp theta to realistic psychometric range [-3.0, +3.0]
            theta = max(-3.0, min(3.0, theta))
            if abs(delta) < 1e-3:
                break

        # Calculate final Standard Error of Estimation SE(θ) = 1 / sqrt(total_info)
        final_info = sum(
            self.fisher_information(
                theta,
                float(item.get("difficulty", 0.0)),
                float(item.get("discrimination", self.default_discrimination))
            )
            for item in responses
        )
        se = 1.0 / math.sqrt(max(final_info, 0.01))

        # Check stopping conditions
        num_items = len(responses)
        has_precision = se <= self.target_se and num_items >= self.min_questions
        has_reached_max = num_items >= self.max_questions
        test_complete = has_precision or has_reached_max

        # Map θ to standard percentile (Standard Normal CDF)
        percentile = round(0.5 * (1.0 + math.erf(theta / math.sqrt(2.0))) * 100, 1)

        # Proficiency banding
        if theta >= 1.2:
            proficiency = "ADVANCED_MASTERY"
            label = "Advanced Practitioner"
        elif theta >= 0.2:
            proficiency = "COMPETENT"
            label = "Competent Professional"
        elif theta >= -0.8:
            proficiency = "INTERMEDIATE"
            label = "Foundational Knowledge"
        else:
            proficiency = "NOVICE_NEEDS_REVIEW"
            label = "Beginner / Remediation Needed"

        # Determine next recommended question difficulty b*
        next_difficulty = round(theta, 2)
        # If last answer was correct, slightly push higher, else step down
        last_correct = responses[-1].get("is_correct", False) if responses else True
        if last_correct:
            next_difficulty = min(2.5, round(theta + 0.4, 2))
        else:
            next_difficulty = max(-2.5, round(theta - 0.5, 2))

        return {
            "theta_ability": round(theta, 3),
            "standard_error": round(se, 3),
            "percentile": percentile,
            "proficiency_level": proficiency,
            "proficiency_label": label,
            "test_complete": test_complete,
            "items_administered": num_items,
            "stopping_criterion_met": has_precision,
            "next_recommended_difficulty": next_difficulty,
            "psychometric_formula": "2PL Item Response Theory (IRT) with Maximum Likelihood Estimation"
        }

cat_engine = ComputerizedAdaptiveTestingEngine()
