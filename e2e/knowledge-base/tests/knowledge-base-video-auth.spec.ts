import { test } from "../../../fixtures";
import { config } from "../../../config";
import { emptyStorageState } from "../../../constants/storage-states";
import { KnowledgeBaseTabSubPage } from "../pages/knowledge-base-tab-sub";
import { LoginDialog } from "../../common/components/login-dialog";

test.describe("知識庫影音專區登入權限", () => {
  test.describe("未登入", () => {
    test.use({
      storageState: emptyStorageState,
    });

    test("未登入進入影音專區時，應顯示登入彈窗與會員提示", async ({
      page,
      videoTagId,
    }) => {
      const knowledgeBaseTabSubPage = new KnowledgeBaseTabSubPage(page);
      const loginDialog = new LoginDialog(page);

      await knowledgeBaseTabSubPage.goto(videoTagId);

      await knowledgeBaseTabSubPage.expectVideoLoginRequiredMessageVisible();

      await loginDialog.expectVisible();
      await knowledgeBaseTabSubPage.expectBodyScrollLocked();
    });
  });

  test.describe("已登入", () => {
    test.use({
      storageState: config.storageState,
    });

    test("已登入進入影音專區時，不應顯示登入彈窗與會員提示", async ({
      page,
      videoTagId,
    }) => {
      const knowledgeBaseTabSubPage = new KnowledgeBaseTabSubPage(page);
      const loginDialog = new LoginDialog(page);

      await knowledgeBaseTabSubPage.goto(videoTagId);

      await knowledgeBaseTabSubPage.expectVideoLoginRequiredMessageHidden();

      await loginDialog.expectHidden();
      await knowledgeBaseTabSubPage.expectBodyScrollNotLocked();
    });
  });
});
