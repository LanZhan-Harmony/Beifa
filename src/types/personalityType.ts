export interface PersonalityType {
  role: PersonalityRoleType;
  keywords: string[];
  proportion?: number;
  friendId: PersonalityRoleId;
  friendMessage: string;
  enemyId: PersonalityRoleId;
  enemyMessage: string;
}

export interface PersonalityRoleType {
  id: PersonalityRoleId;
  name: string;
  tag: string;
  motto: string;
  introductions: PersonalityRoleParagraphType[];
  workplaceAnalyses: PersonalityRoleParagraphType[];
  relationshipAnalyses: PersonalityRoleParagraphType[];
  loveAnalyses: PersonalityRoleParagraphType[];
}

export interface PersonalityRoleParagraphType {
  title: string;
  content: string;
}

export type PersonalityRoleId = "BLG" | "HDH" | "JSQ" | "LXX" | "MTL" | "RSG" | "XHJ" | "XQG";
