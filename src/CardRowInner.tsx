import {
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/** 与 App 侧栏 `narrowUi`、卡片详情等一致：小屏固定上下布局 */
const MOBILE_MQ = "(max-width: 900px)";

type CardRowInnerProps = {
  hasGallery: boolean;
  className: string;
  children: ReactNode;
};

/**
 * 时间线/垃圾桶卡片内层：小屏有附件时固定上下布局；大屏有附件时为左右分栏（正文与轮播并排）。
 */
export function CardRowInner({
  hasGallery,
  className,
  children,
}: CardRowInnerProps) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [stackGallery, setStackGallery] = useState(false);

  /* useLayoutEffect：在绘制前同步，避免首帧仍为左右分栏（瀑布流窄卡下附件与正文叠在一起） */
  useLayoutEffect(() => {
    if (!hasGallery) {
      setStackGallery(false);
      return;
    }
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => {
      setStackGallery(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [hasGallery]);

  const cls =
    className +
    (hasGallery && stackGallery
      ? " card__inner--mobile-gallery-stack"
      : "");

  return (
    <div ref={innerRef} className={cls}>
      {children}
    </div>
  );
}
