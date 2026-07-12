import { Page } from "@playwright/test";
import { HotKnowledgeRankingSection } from "../../common/components/hot-knowledge-ranking-section";
import { routes } from "../../../constants/routes";
import { BasePage } from "../../common/pages/base-page";

export class KnowledgeBaseHomePage extends BasePage {
  // Locators
  readonly hotKnowledgeRankingSection: HotKnowledgeRankingSection;

  constructor(page: Page) {
    super(page);
    this.hotKnowledgeRankingSection = new HotKnowledgeRankingSection(this.page);
  }

  async goto() {
    await this.page.goto(routes.knowledgeBase.root);
  }
}
