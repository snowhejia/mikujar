import type { ReactNode, Ref } from "react";
import type { AuthUser } from "../api/auth";
import { useMediaDisplaySrc } from "../mediaDisplay";
import type { AppDataMode } from "../appDataModeStorage";
import { getAdminToken } from "../auth/token";
import { useAppChrome } from "../i18n/useAppChrome";
import { SidebarWorkspaceAppMark } from "./AppIcons";

/** 头像旁下拉：个人中心、笔记设置、数据统计、用户管理（admin）、登出 */
export function UserAccountMenuDropdown({
  dataMode,
  profileBusy,
  isAdmin,
  onOpenProfile,
  onOpenNoteSettings,
  onOpenDataStats,
  onOpenUserAdmin,
  onLogout,
}: {
  dataMode: AppDataMode;
  profileBusy: boolean;
  isAdmin: boolean;
  onOpenProfile: () => void;
  onOpenNoteSettings: () => void;
  onOpenDataStats: () => void;
  onOpenUserAdmin: () => void;
  onLogout: () => void;
}) {
  const c = useAppChrome();
  const showUserAdmin = isAdmin && dataMode === "remote";
  return (
    <div className="sidebar__user-menu-dropdown" role="menu">
      <button
        type="button"
        className="sidebar__user-menu-item"
        role="menuitem"
        disabled={dataMode !== "remote" || profileBusy}
        title={
          dataMode !== "remote" ? c.profileRemoteOnly : undefined
        }
        onClick={() => {
          onOpenProfile();
        }}
      >
        {c.menuProfile}
      </button>
      <button
        type="button"
        className="sidebar__user-menu-item"
        role="menuitem"
        onClick={() => {
          onOpenNoteSettings();
        }}
      >
        {c.menuNoteSettings}
      </button>
      <button
        type="button"
        className="sidebar__user-menu-item"
        role="menuitem"
        onClick={() => {
          onOpenDataStats();
        }}
      >
        {c.menuDataStats}
      </button>
      {showUserAdmin ? (
        <button
          type="button"
          className="sidebar__user-menu-item"
          role="menuitem"
          onClick={() => {
            onOpenUserAdmin();
          }}
        >
          {c.adminTitle}
        </button>
      ) : null}
      <div className="sidebar__user-menu-sep" role="separator" />
      <button
        type="button"
        className="sidebar__user-menu-item"
        role="menuitem"
        onClick={() => {
          onLogout();
        }}
      >
        {c.logout}
      </button>
    </div>
  );
}

/** Rail 顶部头像槽：折叠时只显示头像，展开时头像 + 昵称。菜单向右弹出。 */
export function RailWorkspaceIdentity({
  writeRequiresLogin,
  currentUser,
  avatarBusy,
  menuWrapRef,
  onAvatarClick,
  menuOpen,
  menuDropdown,
  expanded,
}: {
  writeRequiresLogin: boolean;
  currentUser: AuthUser | null;
  avatarBusy: boolean;
  menuWrapRef: Ref<HTMLDivElement>;
  onAvatarClick: () => void;
  menuOpen: boolean;
  menuDropdown: ReactNode;
  expanded: boolean;
}) {
  const c = useAppChrome();
  const avatarDisplaySrc = useMediaDisplaySrc(
    writeRequiresLogin && (currentUser?.avatarThumbUrl || currentUser?.avatarUrl)
      ? (currentUser.avatarThumbUrl ?? currentUser.avatarUrl)
      : undefined
  );

  const label =
    writeRequiresLogin && currentUser
      ? currentUser.displayName || currentUser.username
      : writeRequiresLogin && getAdminToken()
        ? c.restoringSession
        : "cardnote";

  return (
    <div className={"rail__user" + (expanded ? " rail__user--expanded" : "")}>
      {writeRequiresLogin && currentUser ? (
        <div
          className={
            "rail__user-anchor" +
            (menuOpen ? " rail__user-anchor--open" : "")
          }
          ref={menuWrapRef}
        >
          <button
            type="button"
            className={
              "rail__user-hit" + (avatarBusy ? " rail__user-hit--busy" : "")
            }
            onClick={onAvatarClick}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            aria-label={c.accountMenu}
            title={expanded ? undefined : label}
          >
            {currentUser.avatarThumbUrl || currentUser.avatarUrl ? (
              avatarDisplaySrc ? (
                <img
                  src={avatarDisplaySrc}
                  alt=""
                  className="rail__user-img"
                />
              ) : (
                <span className="rail__user-pending" aria-hidden />
              )
            ) : (
              <SidebarWorkspaceAppMark />
            )}
          </button>
          {menuDropdown}
        </div>
      ) : (
        <div
          className="rail__user-hit rail__user-hit--placeholder"
          aria-hidden
        >
          <SidebarWorkspaceAppMark />
        </div>
      )}
      {expanded ? (
        <span className="rail__user-name" title={label}>
          {label}
        </span>
      ) : null}
    </div>
  );
}

/** 侧栏头像+昵称；点头像打开账户菜单（个人中心、数据模式） */
export function SidebarWorkspaceIdentity({
  writeRequiresLogin,
  currentUser,
  avatarBusy,
  menuWrapRef,
  onAvatarClick,
  menuOpen,
  menuDropdown,
}: {
  writeRequiresLogin: boolean;
  currentUser: AuthUser | null;
  avatarBusy: boolean;
  menuWrapRef: Ref<HTMLDivElement>;
  onAvatarClick: () => void;
  menuOpen: boolean;
  menuDropdown: ReactNode;
}) {
  const c = useAppChrome();
  const avatarDisplaySrc = useMediaDisplaySrc(
    writeRequiresLogin && (currentUser?.avatarThumbUrl || currentUser?.avatarUrl)
      ? (currentUser.avatarThumbUrl ?? currentUser.avatarUrl)
      : undefined
  );

  return (
    <div className="sidebar__workspace">
      {writeRequiresLogin && currentUser ? (
        <>
          <div
            className={
              "sidebar__user-menu-anchor" +
              (menuOpen ? " sidebar__user-menu-anchor--open" : "")
            }
            ref={menuWrapRef}
          >
            <button
              type="button"
              className={
                "sidebar__avatar-hit" +
                (avatarBusy ? " sidebar__avatar-hit--busy" : "")
              }
              onClick={onAvatarClick}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label={c.accountMenu}
              title={c.accountMenu}
            >
              {currentUser.avatarThumbUrl || currentUser.avatarUrl ? (
                avatarDisplaySrc ? (
                  <img
                    src={avatarDisplaySrc}
                    alt=""
                    className="sidebar__avatar-img"
                  />
                ) : (
                  <span className="sidebar__avatar-pending" aria-hidden />
                )
              ) : (
                <SidebarWorkspaceAppMark />
              )}
            </button>
            {menuDropdown}
          </div>
          <div className="sidebar__workspace-text">
            <span className="sidebar__workspace-name">
              {currentUser.displayName || currentUser.username}
            </span>
          </div>
        </>
      ) : writeRequiresLogin && getAdminToken() ? (
        <>
          <SidebarWorkspaceAppMark />
          <div className="sidebar__workspace-text">
            <span className="sidebar__workspace-name">{c.restoringSession}</span>
          </div>
        </>
      ) : (
        <>
          <SidebarWorkspaceAppMark />
          <span className="sidebar__workspace-name">cardnote</span>
        </>
      )}
    </div>
  );
}
