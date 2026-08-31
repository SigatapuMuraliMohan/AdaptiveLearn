package com.personalized.learning.dto;

import java.util.List;

public class OnboardingDTO {

    public static class OnboardingRequest {
        private String goal;
        private String statedLevel; // BEGINNER, INTERMEDIATE, ADVANCED
        private String targetOutcome;
        private String preferredStyle;
        private Integer weeklyHours = 5;
        private String pacePreference; // SLOW, MODERATE, FAST

        public String getGoal() { return goal; }
        public void setGoal(String goal) { this.goal = goal; }

        public String getStatedLevel() { return statedLevel; }
        public void setStatedLevel(String statedLevel) { this.statedLevel = statedLevel; }

        public String getTargetOutcome() { return targetOutcome; }
        public void setTargetOutcome(String targetOutcome) { this.targetOutcome = targetOutcome; }

        public String getPreferredStyle() { return preferredStyle; }
        public void setPreferredStyle(String preferredStyle) { this.preferredStyle = preferredStyle; }

        public Integer getWeeklyHours() { return weeklyHours; }
        public void setWeeklyHours(Integer weeklyHours) { this.weeklyHours = weeklyHours; }

        public String getPacePreference() { return pacePreference; }
        public void setPacePreference(String pacePreference) { this.pacePreference = pacePreference; }
    }

    public static class DiagnosticResultItem {
        private String topic;
        private Double scorePercentage;

        public String getTopic() { return topic; }
        public void setTopic(String topic) { this.topic = topic; }

        public Double getScorePercentage() { return scorePercentage; }
        public void setScorePercentage(Double scorePercentage) { this.scorePercentage = scorePercentage; }
    }

    public static class GeneratePathRequest {
        private List<DiagnosticResultItem> diagnosticScores;

        public List<DiagnosticResultItem> getDiagnosticScores() { return diagnosticScores; }
        public void setDiagnosticScores(List<DiagnosticResultItem> diagnosticScores) { this.diagnosticScores = diagnosticScores; }
    }
}
