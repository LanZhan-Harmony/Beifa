export interface personalityType {
  note: string;
  keywords: string[];
  roles: personalityRoleType[];
}

export interface personalityReportType {
  role: personalityRoleType;
  keywords: string[];
  proportion?: number;
  friendId: personalityRoleId;
  friendMessage: string;
  enemyId: personalityRoleId;
  enemyMessage: string;
}

export interface personalityRoleType {
  id: personalityRoleId;
  name: string;
  tag: string;
  motto: string;
  introductions: personalityRoleParagraphType[];
  workplaceAnalyses: personalityRoleParagraphType[];
  relationshipAnalyses: personalityRoleParagraphType[];
  loveAnalyses: personalityRoleParagraphType[];
}

export interface personalityRoleParagraphType {
  title: string;
  content: string;
}

export type personalityRoleId = "BLG" | "HDH" | "JSQ" | "LXX" | "MTL" | "RSG" | "XHJ" | "XQG";
