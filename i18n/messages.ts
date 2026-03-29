import type { Locale } from "@/types/domain";

type MessageTree = Record<string, string>;

export const messages: Record<Locale, MessageTree> = {
  en: {
    appName: "Mzad Premium Cars",
    browse: "Browse",
    sell: "Sell",
    favorites: "Favorites",
    profile: "Profile",
    login: "Login",
    register: "Register",
    pricing: "Pricing",
    unlockDealRating: "Unlock deal rating with a free account",
    greatDeal: "Great Deal",
    goodDeal: "Good Deal",
    fairPrice: "Fair Price",
    expensive: "Expensive",
    pendingApproval: "Pending admin approval",
    qatarFirst: "Qatar first, GCC-ready architecture",
    listCar: "List your car",
  },
  ar: {
    appName: "مزاد السيارات الفاخرة",
    browse: "تصفح",
    sell: "بيع",
    favorites: "المفضلة",
    profile: "الملف الشخصي",
    login: "تسجيل الدخول",
    register: "إنشاء حساب",
    pricing: "الباقات",
    unlockDealRating: "افتح تقييم الصفقة بحساب مجاني",
    greatDeal: "صفقة ممتازة",
    goodDeal: "صفقة جيدة",
    fairPrice: "سعر عادل",
    expensive: "مرتفع السعر",
    pendingApproval: "بانتظار موافقة المشرف",
    qatarFirst: "قطر أولًا مع جاهزية للتوسع الخليجي",
    listCar: "أضف سيارتك",
  },
};
