/**
 * THEORY MANAGER
 * Manages theories, challenges, and discoveries
 */

class TheoryManager {
  constructor() {
    this.theories = new Map();
    this.discoveries = [];
    this.challenges = [];
    this.validatedTheories = [];
    this.rejectedTheories = [];
  }

  /**
   * Add a new theory
   */
  addTheory(theory) {
    const theoryWithMeta = {
      ...theory,
      id: theory.id || this.generateId(),
      status: 'proposed',
      timestamp: Date.now(),
      challenges: [],
      votes: { support: 0, oppose: 0 },
      approvalRating: null
    };

    this.theories.set(theoryWithMeta.id, theoryWithMeta);
    return theoryWithMeta;
  }

  /**
   * Get theory by ID
   */
  getTheory(id) {
    return this.theories.get(id);
  }

  /**
   * Get all theories
   */
  getAllTheories() {
    return Array.from(this.theories.values());
  }

  /**
   * Get theories by status
   */
  getTheoriesByStatus(status) {
    return this.getAllTheories().filter(t => t.status === status);
  }

  /**
   * Get recent theories
   */
  getRecentTheories(limit = 10) {
    return this.getAllTheories()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get theories by proposer
   */
  getTheoriesByProposer(proposerKey) {
    return this.getAllTheories().filter(t => t.proposedByKey === proposerKey);
  }

  /**
   * Add challenge to a theory
   */
  addChallenge(theoryId, challenge) {
    const theory = this.theories.get(theoryId);
    if (!theory) return null;

    const challengeWithMeta = {
      id: this.generateId(),
      ...challenge,
      theoryId,
      timestamp: Date.now()
    };

    theory.challenges.push(challengeWithMeta);
    theory.status = 'challenged';
    this.challenges.push(challengeWithMeta);

    // Update approval rating based on challenge
    this.updateApprovalRating(theoryId, challenge.agreementLevel);

    return challengeWithMeta;
  }

  /**
   * Update approval rating for a theory
   */
  updateApprovalRating(theoryId, newRating) {
    const theory = this.theories.get(theoryId);
    if (!theory) return;

    if (theory.approvalRating === null) {
      theory.approvalRating = newRating;
    } else {
      // Running average
      const totalVotes = theory.votes.support + theory.votes.oppose + 1;
      theory.approvalRating = (
        (theory.approvalRating * (totalVotes - 1) + newRating) / totalVotes
      );
    }

    // Update vote counts
    if (newRating >= 50) {
      theory.votes.support++;
    } else {
      theory.votes.oppose++;
    }

    // Update status based on rating
    this.updateTheoryStatus(theoryId);
  }

  /**
   * Update theory status based on votes and approval
   */
  updateTheoryStatus(theoryId) {
    const theory = this.theories.get(theoryId);
    if (!theory) return;

    const totalVotes = theory.votes.support + theory.votes.oppose;

    if (totalVotes >= 3) {
      if (theory.approvalRating >= 75) {
        theory.status = 'validated';
        if (!this.validatedTheories.includes(theoryId)) {
          this.validatedTheories.push(theoryId);
        }
      } else if (theory.approvalRating < 30) {
        theory.status = 'rejected';
        if (!this.rejectedTheories.includes(theoryId)) {
          this.rejectedTheories.push(theoryId);
        }
      } else {
        theory.status = 'debated';
      }
    }
  }

  /**
   * Add a discovery
   */
  addDiscovery(discovery) {
    const discoveryWithMeta = {
      id: this.generateId(),
      ...discovery,
      timestamp: Date.now()
    };

    this.discoveries.push(discoveryWithMeta);
    return discoveryWithMeta;
  }

  /**
   * Get recent discoveries
   */
  getRecentDiscoveries(limit = 10) {
    return this.discoveries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get statistics
   */
  getStats() {
    const theories = this.getAllTheories();

    return {
      totalTheories: theories.length,
      proposedTheories: theories.filter(t => t.status === 'proposed').length,
      challengedTheories: theories.filter(t => t.status === 'challenged').length,
      validatedTheories: theories.filter(t => t.status === 'validated').length,
      rejectedTheories: theories.filter(t => t.status === 'rejected').length,
      debatedTheories: theories.filter(t => t.status === 'debated').length,
      totalChallenges: this.challenges.length,
      totalDiscoveries: this.discoveries.length,
      averageApproval: this.calculateAverageApproval()
    };
  }

  /**
   * Calculate average approval rating across all theories
   */
  calculateAverageApproval() {
    const theoriesWithRating = this.getAllTheories().filter(
      t => t.approvalRating !== null
    );

    if (theoriesWithRating.length === 0) return null;

    const sum = theoriesWithRating.reduce((acc, t) => acc + t.approvalRating, 0);
    return sum / theoriesWithRating.length;
  }

  /**
   * Get elite theories (high approval)
   */
  getEliteTheories(minApproval = 85) {
    return this.getAllTheories().filter(
      t => t.approvalRating !== null && t.approvalRating >= minApproval
    );
  }

  /**
   * Search theories by keyword
   */
  searchTheories(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.getAllTheories().filter(t =>
      t.name.toLowerCase().includes(lowerKeyword) ||
      (t.description && t.description.toLowerCase().includes(lowerKeyword))
    );
  }

  /**
   * Export data for reports
   */
  exportData() {
    return {
      theories: this.getAllTheories(),
      discoveries: this.discoveries,
      challenges: this.challenges,
      stats: this.getStats()
    };
  }

  /**
   * Import data (for persistence)
   */
  importData(data) {
    if (data.theories) {
      data.theories.forEach(t => this.theories.set(t.id, t));
    }
    if (data.discoveries) {
      this.discoveries = data.discoveries;
    }
    if (data.challenges) {
      this.challenges = data.challenges;
    }
  }

  /**
   * Clear all data
   */
  clear() {
    this.theories.clear();
    this.discoveries = [];
    this.challenges = [];
    this.validatedTheories = [];
    this.rejectedTheories = [];
  }

  /**
   * Generate unique ID
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = { TheoryManager };
