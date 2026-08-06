const CodingQuestion = require('../models/CodingQuestion');
const MCQQuestion = require('../models/MCQQuestion');
const Subject = require('../models/Subject');

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

// Supported company metadata & preset question pools
const COMPANY_PRESETS = {
  google: {
    name: 'Google',
    badge: 'FAANG / Tier 1',
    description: 'Focuses heavily on Data Structures, Algorithms, Graph Theory, and Dynamic Programming.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
    topics: ['Arrays', 'Dynamic Programming', 'Trees & Graphs', 'System Design'],
  },
  amazon: {
    name: 'Amazon',
    badge: 'FAANG / Tier 1',
    description: 'High emphasis on Binary Trees, Hash Tables, Strings, and Leadership Principles aptitude.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg',
    topics: ['Hash Tables', 'Trees', 'Sorting', 'Leadership Principles'],
  },
  microsoft: {
    name: 'Microsoft',
    badge: 'Big Tech',
    description: 'Focuses on Linked Lists, Matrix operations, Recursion, and System Architecture.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    topics: ['Linked Lists', 'Arrays', 'Recursion', 'Logic & Aptitude'],
  },
  amdocs: {
    name: 'Amdocs',
    badge: 'Telecom Tech',
    description: 'Core Focus on SQL, Java/OOPs, General Quantitative Aptitude, and Data Structures.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Amdocs_logo.svg',
    topics: ['SQL & Databases', 'Java & OOP', 'Quantitative Aptitude', 'Arrays'],
  },
  meta: {
    name: 'Meta (Facebook)',
    badge: 'FAANG / Tier 1',
    description: 'Fast-paced algorithmic questions, Arrays, Two Pointers, and Graph Traversals.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg',
    topics: ['Two Pointers', 'Graphs', 'Strings', 'Logical Reasoning'],
  },
  tcs: {
    name: 'TCS (Digital / NQT)',
    badge: 'Service & Digital',
    description: 'Analytical Reasoning, Numerical Aptitude, Coding Logic, and Basic DSA.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Tata_Consultancy_Services_Logo.svg',
    topics: ['Numerical Ability', 'Verbal Reasoning', 'C/C++ Basics', 'Arrays'],
  },
  infosys: {
    name: 'Infosys (Power Programmer)',
    badge: 'Tech Giant',
    description: 'Pseudo Code Analysis, Advanced Quantitative Skills, and Medium Algorithm Challenges.',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Infosys_logo.svg',
    topics: ['Pseudocode', 'Quantitative Aptitude', 'Pointers & Memory', 'Algorithms'],
  },
};

// Built-in Seed Company Aptitude Questions
const COMPANY_APTITUDE_BANK = {
  google: [
    {
      question: 'A train 150m long moving at 60 km/h passes a platform in 30 seconds. What is the length of the platform?',
      options: ['350 meters', '300 meters', '250 meters', '400 meters'],
      correctAnswerIndex: 0,
      marks: 2,
      difficulty: 'moderate',
      topic: 'Quantitative Aptitude',
    },
    {
      question: 'In a group of 6 people, what is the minimum number of handshakes required so everyone shakes hands with everyone else?',
      options: ['12', '15', '30', '10'],
      correctAnswerIndex: 1,
      marks: 2,
      difficulty: 'easy',
      topic: 'Logical Reasoning',
    },
  ],
  amazon: [
    {
      question: 'If 12 men or 18 women can do a piece of work in 14 days, how long will 8 men and 16 women take to finish it?',
      options: ['9 days', '10 days', '12 days', '14 days'],
      correctAnswerIndex: 0,
      marks: 2,
      difficulty: 'moderate',
      topic: 'Quantitative Aptitude',
    },
    {
      question: 'Complete the series: 4, 9, 25, 49, 121, ___',
      options: ['144', '169', '196', '225'],
      correctAnswerIndex: 1,
      marks: 2,
      difficulty: 'moderate',
      topic: 'Logical Reasoning',
    },
  ],
  microsoft: [
    {
      question: 'What is the time complexity of building a heap from an array of N elements?',
      options: ['O(N log N)', 'O(N)', 'O(N^2)', 'O(log N)'],
      correctAnswerIndex: 1,
      marks: 2,
      difficulty: 'moderate',
      topic: 'Data Structures & CS Core',
    },
    {
      question: 'Find the odd one out: 3, 5, 11, 14, 17, 21',
      options: ['14', '21', '11', '17'],
      correctAnswerIndex: 0,
      marks: 2,
      difficulty: 'easy',
      topic: 'Logical Reasoning',
    },
  ],
  amdocs: [
    {
      question: 'In SQL, which clause is used to filter records resulting from a GROUP BY statement?',
      options: ['WHERE', 'HAVING', 'FILTER', 'ORDER BY'],
      correctAnswerIndex: 1,
      marks: 2,
      difficulty: 'easy',
      topic: 'Database & SQL',
    },
    {
      question: 'If a sweater marked at $80 is sold for $68, what is the discount percentage?',
      options: ['12%', '15%', '18%', '20%'],
      correctAnswerIndex: 1,
      marks: 2,
      difficulty: 'easy',
      topic: 'Quantitative Aptitude',
    },
  ],
  tcs: [
    {
      question: 'A bag contains 5 red balls and 7 blue balls. Two balls are drawn at random without replacement. What is the probability that both are red?',
      options: ['5/33', '10/33', '7/33', '5/66'],
      correctAnswerIndex: 0,
      marks: 2,
      difficulty: 'moderate',
      topic: 'Probability & Numerical Ability',
    },
  ],
};

// Seed Coding Fallbacks (Used if LeetCode GraphQL endpoint times out or fails network access)
const SEED_CODING_QUESTIONS = [
  {
    title: 'Two Sum (Company Classic)',
    leetcodeSlug: 'two-sum',
    difficulty: 'easy',
    companyTags: ['google', 'amazon', 'microsoft', 'meta'],
    description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]',
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    testCases: [
      { input: '[2, 7, 11, 15]\n9', expectedOutput: '[0, 1]', isSample: true },
      { input: '[3, 2, 4]\n6', expectedOutput: '[1, 2]', isSample: true },
      { input: '[3, 3]\n6', expectedOutput: '[0, 1]', isSample: false },
    ],
    templates: [
      { language: 'javascript', starterCode: 'function twoSum(nums, target) {\n  // Write your code here\n}' },
      { language: 'python', starterCode: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    pass' },
      { language: 'cpp', starterCode: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};' },
      { language: 'java', starterCode: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}' },
    ],
    marks: 10,
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    leetcodeSlug: 'longest-substring-without-repeating-characters',
    difficulty: 'moderate',
    companyTags: ['amazon', 'google', 'meta'],
    description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    sampleInput: 's = "abcabcbb"',
    sampleOutput: '3',
    constraints: '0 <= s.length <= 5 * 10^4',
    testCases: [
      { input: 'abcabcbb', expectedOutput: '3', isSample: true },
      { input: 'bbbbb', expectedOutput: '1', isSample: true },
      { input: 'pwwkew', expectedOutput: '3', isSample: false },
    ],
    templates: [
      { language: 'javascript', starterCode: 'function lengthOfLongestSubstring(s) {\n  // Write your solution here\n}' },
      { language: 'python', starterCode: 'def lengthOfLongestSubstring(s: str) -> int:\n    pass' },
    ],
    marks: 15,
  },
  {
    title: 'Reverse Linked List',
    leetcodeSlug: 'reverse-linked-list',
    difficulty: 'easy',
    companyTags: ['microsoft', 'amdocs', 'amazon'],
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    sampleInput: 'head = [1,2,3,4,5]',
    sampleOutput: '[5,4,3,2,1]',
    constraints: 'The number of nodes in the list is in the range [0, 5000].',
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isSample: true },
    ],
    templates: [
      { language: 'javascript', starterCode: 'function reverseList(head) {\n  // Write solution\n}' },
      { language: 'python', starterCode: 'def reverseList(head):\n    pass' },
    ],
    marks: 10,
  },
];

/**
 * Send GraphQL Request to LeetCode
 */
const queryLeetCodeGraphQL = async (query, variables = {}) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://leetcode.com',
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[LeetCode GraphQL] HTTP error status: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.warn('[LeetCode GraphQL] External request failed or timed out:', error.message);
    return null;
  }
};

/**
 * Fetch Company Problems from LeetCode GraphQL
 */
exports.fetchCompanyProblemsFromLeetCode = async (companySlug = 'google', limit = 10) => {
  const query = `
    query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
      problemsetQuestionList: questionList(
        categorySlug: $categorySlug
        limit: $limit
        skip: $skip
        filters: $filters
      ) {
        totalNum
        questions: data {
          acRate
          difficulty
          title
          titleSlug
          topicTags {
            name
            slug
          }
        }
      }
    }
  `;

  const variables = {
    categorySlug: '',
    limit: limit,
    skip: 0,
    filters: { searchKeywords: companySlug },
  };

  const data = await queryLeetCodeGraphQL(query, variables);

  if (data?.data?.problemsetQuestionList?.questions) {
    return data.data.problemsetQuestionList.questions.map((q) => ({
      title: q.title,
      titleSlug: q.titleSlug,
      difficulty: q.difficulty?.toLowerCase() === 'medium' ? 'moderate' : q.difficulty?.toLowerCase() === 'hard' ? 'difficult' : 'easy',
      acRate: q.acRate ? q.acRate.toFixed(1) : 'N/A',
      tags: q.topicTags?.map((t) => t.name) || [],
      company: companySlug,
    }));
  }

  // Fallback to local high-quality seed list filtered by company
  return SEED_CODING_QUESTIONS.filter((q) => q.companyTags.includes(companySlug.toLowerCase())).map((q) => ({
    title: q.title,
    titleSlug: q.leetcodeSlug,
    difficulty: q.difficulty,
    acRate: '65.4',
    tags: ['Algorithms', 'Array'],
    company: companySlug,
  }));
};

/**
 * Fetch Detailed Question Information for a LeetCode Slug
 */
exports.fetchQuestionDetailFromLeetCode = async (titleSlug) => {
  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        questionId
        title
        titleSlug
        content
        difficulty
        sampleTestCase
        topicTags {
          name
        }
        codeSnippets {
          lang
          langSlug
          code
        }
      }
    }
  `;

  const data = await queryLeetCodeGraphQL(query, { titleSlug });
  const question = data?.data?.question;

  if (question) {
    // Standardize snippets
    const templates = (question.codeSnippets || []).map((s) => {
      let lang = s.langSlug;
      if (lang === 'python3') lang = 'python';
      if (lang === 'cpp') lang = 'cpp';
      if (lang === 'javascript') lang = 'javascript';
      if (lang === 'java') lang = 'java';
      return {
        language: ['javascript', 'python', 'cpp', 'java'].includes(lang) ? lang : 'javascript',
        starterCode: s.code,
      };
    });

    // Clean HTML tags for plain text description or keep clean HTML
    const cleanDescription = question.content
      ? question.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : 'Solve the problem according to standard specifications.';

    return {
      title: question.title,
      leetcodeSlug: question.titleSlug,
      difficulty: question.difficulty?.toLowerCase() === 'medium' ? 'moderate' : question.difficulty?.toLowerCase() === 'hard' ? 'difficult' : 'easy',
      description: cleanDescription,
      sampleInput: question.sampleTestCase || 'Input array/string',
      sampleOutput: 'Expected solution output',
      testCases: [
        {
          input: question.sampleTestCase || '[1,2,3]',
          expectedOutput: 'Output',
          isSample: true,
        },
      ],
      templates: templates.length > 0 ? templates : [
        { language: 'javascript', starterCode: 'function solution() {\n  // Implementation\n}' }
      ],
      marks: question.difficulty === 'Hard' ? 20 : question.difficulty === 'Medium' ? 15 : 10,
    };
  }

  // Fallback to matching seed question
  const seed = SEED_CODING_QUESTIONS.find((q) => q.leetcodeSlug === titleSlug) || SEED_CODING_QUESTIONS[0];
  return seed;
};

/**
 * Get Available Company Metadata Presets
 */
exports.getCompanyPresets = () => COMPANY_PRESETS;

/**
 * Seed/Retrieve Company Aptitude MCQs
 */
exports.getCompanyAptitudeBank = (companySlug) => {
  const companyKey = companySlug.toLowerCase();
  return COMPANY_APTITUDE_BANK[companyKey] || COMPANY_APTITUDE_BANK.google;
};
