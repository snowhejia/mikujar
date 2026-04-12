import { useLayoutEffect, useState, type ReactNode } from "react";

import {
  MOBILE_CHROME_MEDIA,
  TABLET_WIDE_TOUCH_MEDIA,
  TIMELINE_GALLERY_STACK_EXIT_BODY_LINES,
  TIMELINE_GALLERY_STACK_MIN_BODY_LINES,
} from "./appkit/appConstants";

/** 与 App `narrowUi`、卡片详情一致：窄屏或大屏触控平板时多为上下布局 */

type CardRowInnerProps = {
  hasGallery: boolean;
  className: string;
  children: ReactNode;
  /**
   * 时间线列数。多列瀑布时固定上下叠放；单列表头再结合 {@link bodyLineEstimate} 决定是否上下叠放。
   */
  timelineColumnCount?: number;
  /**
   * 从正文 HTML 估算的行数（稳定、不随当前纸宽变化），有附件且单列表头时参与判定。
   */
  bodyLineEstimate: number;
};

/**
 * 视口强制上下叠放，或单列表头时按正文估算行数 + 滞回决定是否上下叠放。
 */
function computeGalleryStack(
  hasGallery: boolean,
  timelineColumnCount: number | undefined,
  wasStacked: boolean,
  bodyLineEstimate: number
): boolean {
  if (!hasGallery) return false;
  const mqMobile = window.matchMedia(MOBILE_CHROME_MEDIA);
  const mqTablet = window.matchMedia(TABLET_WIDE_TOUCH_MEDIA);
  const mqPhoneNarrow = window.matchMedia("(max-width: 900px)");
  const mobileChrome = mqMobile.matches;
  const tabletWide = mqTablet.matches;
  const tabletSingleCol = tabletWide && timelineColumnCount === 1;
  const phoneNarrowOneCol =
    mqPhoneNarrow.matches && timelineColumnCount === 1;

  /**
   * 手机壳内仍「固定上下」：窄屏多列、或平板多列（卡宽不足并排）
   */
  if (mobileChrome && !tabletSingleCol && !phoneNarrowOneCol) {
    return true;
  }

  const lines = Math.max(1, bodyLineEstimate);
  if (wasStacked) {
    return lines >= TIMELINE_GALLERY_STACK_EXIT_BODY_LINES;
  }
  return lines >= TIMELINE_GALLERY_STACK_MIN_BODY_LINES;
}

/**
 * 时间线/垃圾桶卡片内层：多列有附件时固定上下布局；
 * 单列表头有附件时按正文估算行数在左右/上下间切换（与像素高度无关）。
 */
export function CardRowInner({
  hasGallery,
  className,
  children,
  timelineColumnCount,
  bodyLineEstimate,
}: CardRowInnerProps) {
  const [stackGallery, setStackGallery] = useState(false);

  useLayoutEffect(() => {
    if (!hasGallery) {
      setStackGallery(false);
      return;
    }

    const mqMobile = window.matchMedia(MOBILE_CHROME_MEDIA);
    const mqTablet = window.matchMedia(TABLET_WIDE_TOUCH_MEDIA);
    const mqPhoneNarrow = window.matchMedia("(max-width: 900px)");

    const apply = () => {
      setStackGallery((prev) => {
        const next = computeGalleryStack(
          hasGallery,
          timelineColumnCount,
          prev,
          bodyLineEstimate
        );
        return next === prev ? prev : next;
      });
    };

    apply();

    mqMobile.addEventListener("change", apply);
    mqTablet.addEventListener("change", apply);
    mqPhoneNarrow.addEventListener("change", apply);

    return () => {
      mqMobile.removeEventListener("change", apply);
      mqTablet.removeEventListener("change", apply);
      mqPhoneNarrow.removeEventListener("change", apply);
    };
  }, [hasGallery, timelineColumnCount, bodyLineEstimate]);

  const cls =
    className +
    (hasGallery && stackGallery
      ? " card__inner--mobile-gallery-stack"
      : "");

  return <div className={cls}>{children}</div>;
}
