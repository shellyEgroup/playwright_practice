import { test } from "../../../../fixtures";
import { KnowledgeBaseTabSubPage } from "../../pages/knowledge-base-tab-sub";
import { LoginDialog } from "../../../common/components/login-dialog";

test.describe("知識庫影音專區登入權限 - 未登入", () => {
  test(
    "未登入進入影音專區時，應顯示登入彈窗與會員提示",
    {
      tag: "@Regression",
    },
    async ({ page, videoTagId }) => {
      const knowledgeBaseTabSubPage = new KnowledgeBaseTabSubPage(page);
      const loginDialog = new LoginDialog(page);

      await knowledgeBaseTabSubPage.goto(videoTagId);

      await knowledgeBaseTabSubPage.expectVideoLoginRequiredMessageVisible();
      await knowledgeBaseTabSubPage.expectHeaderPrimaryActionsAvailable();
      await knowledgeBaseTabSubPage.expectRestrictedOverlayToFullyCoverBelowHeader();

      await loginDialog.expectVisible();
      await knowledgeBaseTabSubPage.expectBodyScrollLocked();
    },
  );
});
