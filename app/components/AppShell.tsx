"use client";

import Link from "next/link";
import { LearningProvider, useLearning } from "./LearningProvider";

const navigation = [
  { href: "/", label: "Hôm nay", mark: "01" },
  { href: "/lessons", label: "Bài học", mark: "02" },
  { href: "/vocabulary", label: "Từ vựng", mark: "03" },
  { href: "/progress", label: "Tiến độ", mark: "04" },
];

function Shell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  const { resetAll } = useLearning();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href="/" aria-label="Night English - Trang chủ">
          <span className="brand-moon" aria-hidden="true">☾</span>
          <span>
            <strong>Night English</strong>
            <small>Read gently. Grow daily.</small>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Điều hướng chính">
          {navigation.map((item) => (
            <Link
              className={active === item.href ? "nav-item active" : "nav-item"}
              href={item.href}
              key={item.href}
            >
              <span className="nav-mark">{item.mark}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="eyebrow">Nhịp học</span>
          <strong>20–30 phút</strong>
          <p>Chậm rãi, đều đặn, không cần hoàn hảo.</p>
        </div>

        <button className="reset-button" type="button" onClick={resetAll}>
          Đặt lại dữ liệu
        </button>
      </aside>

      <main className="main-content">{children}</main>

      <nav className="mobile-nav" aria-label="Điều hướng trên điện thoại">
        {navigation.map((item) => (
          <Link
            className={active === item.href ? "active" : ""}
            href={item.href}
            key={item.href}
          >
            <span>{item.mark}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <LearningProvider>
      <Shell active={active}>{children}</Shell>
    </LearningProvider>
  );
}
