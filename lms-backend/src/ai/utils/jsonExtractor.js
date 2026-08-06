/**
 * Utility for robust extraction and parsing of JSON from LLM outputs.
 * Handles markdown code fences, conversational framing, and malformed wrapper characters.
 */
class JsonExtractor {
  /**
   * Cleans raw text from LLM and parses it safely into an object.
   * @param {string} text - Raw output string from LLM
   * @returns {Object} Parsed JSON object
   * @throws {Error} If parsing fails completely
   */
  static extractAndParse(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid input: Text must be a non-empty string.');
    }

    let cleaned = text.trim();

    // 1. Strip markdown code fences if present (```json ... ``` or ``` ...)
    const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (codeBlockMatch && codeBlockMatch[1]) {
      cleaned = codeBlockMatch[1].trim();
    }

    // 2. Direct parse attempt
    try {
      return JSON.parse(cleaned);
    } catch (firstError) {
      // 3. Fallback: Find the outermost JSON object { ... } or array [ ... ]
      const firstBrace = cleaned.indexOf('{');
      const firstBracket = cleaned.indexOf('[');
      
      let startIdx = -1;
      let endIdx = -1;

      if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
        startIdx = firstBrace;
        endIdx = cleaned.lastIndexOf('}');
      } else if (firstBracket !== -1) {
        startIdx = firstBracket;
        endIdx = cleaned.lastIndexOf(']');
      }

      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const candidate = cleaned.slice(startIdx, endIdx + 1);
        try {
          return JSON.parse(candidate);
        } catch (secondError) {
          throw new Error(`JSON Extraction failed: Could not parse extracted boundary block. Raw snippet: ${cleaned.substring(0, 100)}...`);
        }
      }

      throw new Error(`JSON Extraction failed: No JSON boundaries found in response. Raw snippet: ${cleaned.substring(0, 100)}...`);
    }
  }
}

module.exports = JsonExtractor;
