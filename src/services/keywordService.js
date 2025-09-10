const IGNORED_KEYWORDS_KEY = "ignored_keywords";

export default {
  getIgnoredKeywords() {
    try {
      const keywords = localStorage.getItem(IGNORED_KEYWORDS_KEY);
      return keywords ? JSON.parse(keywords) : this.getDefaultIgnoredKeywords();
    } catch (error) {
      console.error("Error getting ignored keywords from localStorage:", error);
      return this.getDefaultIgnoredKeywords();
    }
  },

  saveIgnoredKeywords(keywords) {
    try {
      localStorage.setItem(IGNORED_KEYWORDS_KEY, JSON.stringify(keywords));
    } catch (error) {
      console.error("Error saving ignored keywords to localStorage:", error);
    }
  },  

  getDefaultIgnoredKeywords() {
    return [
      { id: 1, keyword: "payment received", active: true },
    ];
  },

  shouldIgnoreTransaction(description) {
    if (!description) return false;

    const normalizedDesc = description.toLowerCase().trim();
    const ignoredKeywords = this.getIgnoredKeywords();

    // Check if any active ignored keyword is in the description
    return ignoredKeywords.some(
      (item) =>
        item.active && normalizedDesc.includes(item.keyword.toLowerCase())
    );
  },
};
