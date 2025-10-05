export interface TopicConfig {
  id: string;
  code: string;
  title: string;
  description: string;
  constraints?: string[];
  examples?: string[];
}

export interface SubStrandConfig {
  title: string;
  topics: TopicConfig[];
}

export interface StrandConfig {
  title: string;
  subStrands: Record<string, SubStrandConfig>;
}

export interface GradeConfig {
  strands: Record<string, StrandConfig>;
}

export const CURRICULUM = {
  PRIMARY_5: {
    strands: {
      NUMBER_ALGEBRA: {
        title: "Number and Algebra",
        subStrands: {
          FRACTIONS: {
            title: "Fractions",
            topics: [
              {
                id: "p5_fr_2.2",
                code: "2.2",
                title: "Multiplying fraction by whole number",
                description:
                  "multiplying a proper/improper fraction and a whole number without calculator",
                constraints: ["no calculator"],
                examples: ["3/5 × 8", "11/4 × 6"],
              },
              {
                id: "p5_fr_2.3",
                code: "2.3",
                title: "Multiplying proper fractions",
                description:
                  "multiplying a proper fraction and a proper/improper fraction without calculator",
                constraints: ["no calculator", "at least one proper fraction"],
                examples: ["2/3 × 3/4", "1/2 × 7/5"],
              },
            ],
          },
          PERCENTAGE: {
            title: "Percentage",
            topics: [
              {
                id: "p5_pct_1.3",
                code: "1.3",
                title: "Finding percentage of whole",
                description: "finding a percentage part of a whole",
                constraints: ["must use % symbol"],
                examples: ["Find 30% of 80", "What is 15% of 200?"],
              },
              {
                id: "p5_pct_1.4",
                code: "1.4",
                title: "Discount, GST, Interest",
                description: "finding discount, GST and annual interest",
                constraints: ["real-world context required"],
                examples: [
                  "A shirt costs $50. Find the discount at 20% off.",
                  "Calculate 9% GST on $100.",
                ],
              },
            ],
          },
        },
      },
      MEASUREMENT_GEOMETRY: {
        title: "Measurement and Geometry",
        subStrands: {
          AREA_VOLUME: {
            title: "Area and Volume",
            topics: [
              {
                id: "p5_av_1.2",
                code: "1.2",
                title: "Area of triangle",
                description:
                  "calculating area of triangle using base × height ÷ 2",
                constraints: [
                  "formula: ½ × base × height",
                  "include units (cm², m²)",
                ],
                examples: [
                  "Find area of triangle with base 8cm and height 5cm",
                ],
              },
            ],
          },
        },
      },
    },
  },
} as const;

export function getTopicById(topicId: string): TopicConfig | null {
  for (const grade of Object.values(CURRICULUM)) {
    for (const strand of Object.values(grade.strands)) {
      for (const subStrand of Object.values(strand.subStrands)) {
        const topic = subStrand.topics.find((t) => t.id === topicId);
        if (topic) return topic;
      }
    }
  }
  return null;
}

export function getTopicsByGrade(grade: "PRIMARY_5"): TopicConfig[] {
  const topics: TopicConfig[] = [];
  const gradeData = CURRICULUM[grade];

  for (const strand of Object.values(gradeData.strands)) {
    for (const subStrand of Object.values(strand.subStrands)) {
      topics.push(...subStrand.topics);
    }
  }

  return topics;
}

export function getRandomTopic(grade: "PRIMARY_5"): TopicConfig {
  const topics = getTopicsByGrade(grade);
  return topics[Math.floor(Math.random() * topics.length)];
}
