// import {tencentTextSecurity} from "@/lib/content/tencent";
import { baiduTextSecurity } from "@/lib/content/baidu";
import { TEXT_SECURITY } from '@/utils/app/const';

export async function textSecurity(conversation: any) {
  /* If the secure text TEXT_SECURITY is not set up.*/
  if (!TEXT_SECURITY) return true;

  switch (TEXT_SECURITY?.toLowerCase()) {
    case "baidu":
      return await baiduTextSecurity(JSON.stringify(conversation));
    // case "tencent":
    //   const suggestion = await tencentTextSecurity(
    //     JSON.stringify(conversation)
    //   );
    //   return suggestion.toLowerCase() === "pass";
    default:
      return true;
  }
}
