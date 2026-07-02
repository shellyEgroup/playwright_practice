export const defaultLimit = 10;

export const modules = {
  knowledgeBase: "knowledgeBase",
  popular: "popular",
} as const;

export const tagGroupId = "0qyfmavbcTeB3tNHVsdrbA"; // 熱門知識庫的 tagGroupId

export const knowledgeBaseTab = {
  video: "影音專區",
};

export const serviceModules = {
  article: "ARTICLE",
} as const;

export const actionTypes = {
  read: "READ",
} as const;

export const dateRangePresets = {
  allTime: {
    label: "所有時間",
    value: "ALL_TIME",
  },
  last30Days: {
    label: "最近30天",
    value: "LAST_30_DAYS",
  },
  last7Days: {
    label: "最近7天",
    value: "LAST_7_DAYS",
  },
  last3Days: {
    label: "最近3天",
    value: "LAST_3_DAYS",
  },
  today: {
    label: "今天",
    value: "TODAY",
  },
  yesterday: {
    label: "昨天",
    value: "YESTERDAY",
  },
  thisWeek: {
    label: "本週",
    value: "THIS_WEEK",
  },
  thisMonth: {
    label: "本月",
    value: "THIS_MONTH",
  },
  last3Months: {
    label: "最近3個月",
    value: "LAST_3_MONTHS",
  },
  last6Months: {
    label: "最近6個月",
    value: "LAST_6_MONTHS",
  },
  lastYear: {
    label: "最近1年",
    value: "LAST_YEAR",
  },
} as const;

export const filterKeys = {
  knowledgeBase: "C24_2",
} as const;
