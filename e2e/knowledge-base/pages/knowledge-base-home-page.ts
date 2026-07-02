import { Page } from "@playwright/test";
import { HotKnowledgeRankingSection } from "../../common/components/hot-knowledge-ranking-section";
import { routes } from "../../../constants/routes";

export class KnowledgeBaseHomePage {
  readonly page: Page;

  // Locators
  readonly hotKnowledgeRankingSection: HotKnowledgeRankingSection;

  constructor(page: Page) {
    this.page = page;
    this.hotKnowledgeRankingSection = new HotKnowledgeRankingSection(this.page);
  }

  async goto() {
    await this.page.goto(routes.knowledgeBase.root);
  }
}
