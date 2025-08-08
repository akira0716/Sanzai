import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { MonthlyReport, YearlyReport } from "../types";
import { formatCurrency, getMonthName } from "./reportUtils";

export interface PDFExportOptions {
  filename?: string;
  orientation?: "portrait" | "landscape";
  includeCharts?: boolean;
  includeDetails?: boolean;
}

// oklchカラー関数を標準的なCSSカラーに変換する関数
function convertOklchColors(element: HTMLElement): void {
  // Tailwind CSSのクラスを一時的に無効化
  const originalClasses = element.className;
  const allElements = element.querySelectorAll("*");

  // 要素とその子要素すべてのTailwindクラスを一時的に削除
  [element, ...Array.from(allElements)].forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (
      (htmlEl.className && htmlEl.className.includes("text-")) ||
      htmlEl.className.includes("bg-")
    ) {
      // Tailwindカラー関連のクラスを削除
      const classes = htmlEl.className
        .split(" ")
        .filter(
          (cls) =>
            !cls.startsWith("text-") &&
            !cls.startsWith("bg-") &&
            !cls.startsWith("border-")
        );
      htmlEl.className = classes.join(" ");
    }
  });

  // 基本的なスタイルを適用
  element.style.backgroundColor = "#ffffff";
  element.style.color = "#000000";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.fontSize = "12px";
  element.style.lineHeight = "1.4";
}

// oklchカラーを簡易的にRGBに変換（近似値）
function convertOklchToRgb(oklchColor: string): string {
  // oklchカラーの一般的な変換（近似値）
  const oklchMap: { [key: string]: string } = {
    "oklch(0.2 0.05 240)": "rgb(51, 51, 51)", // ダークグレー
    "oklch(0.5 0.05 240)": "rgb(128, 128, 128)", // グレー
    "oklch(0.8 0.05 240)": "rgb(204, 204, 204)", // ライトグレー
    "oklch(0.95 0.05 240)": "rgb(245, 245, 245)", // ほぼ白
    "oklch(0.2 0.1 120)": "rgb(34, 139, 34)", // ダークグリーン
    "oklch(0.6 0.15 120)": "rgb(76, 175, 80)", // グリーン
    "oklch(0.2 0.1 0)": "rgb(139, 34, 34)", // ダークレッド
    "oklch(0.6 0.15 0)": "rgb(244, 67, 54)", // レッド
    "oklch(0.2 0.1 240)": "rgb(34, 34, 139)", // ダークブルー
    "oklch(0.6 0.15 240)": "rgb(33, 150, 243)", // ブルー
  };

  // 完全一致をチェック
  if (oklchMap[oklchColor]) {
    return oklchMap[oklchColor];
  }

  // 部分一致をチェック（oklch関数のパターンマッチング）
  if (oklchColor.includes("oklch")) {
    // 一般的なフォールバック
    if (oklchColor.includes("0.95") || oklchColor.includes("1")) {
      return "rgb(255, 255, 255)"; // 白
    }
    if (oklchColor.includes("0.1") || oklchColor.includes("0.2")) {
      return "rgb(51, 51, 51)"; // ダークグレー
    }
    if (oklchColor.includes("120")) {
      return "rgb(76, 175, 80)"; // グリーン
    }
    if (oklchColor.includes("0")) {
      return "rgb(244, 67, 54)"; // レッド
    }
    if (oklchColor.includes("240")) {
      return "rgb(33, 150, 243)"; // ブルー
    }
  }

  // デフォルトフォールバック
  return "rgb(0, 0, 0)";
}

export async function generatePDFFromElement(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const { filename = "report.pdf", orientation = "portrait" } = options;

  try {
    // 要素が存在するかチェック
    if (!element) {
      throw new Error("PDF生成対象の要素が見つかりません");
    }

    // oklchカラーを標準的なCSSカラーに変換
    convertOklchColors(element);

    // 要素を一時的に表示状態にする
    const originalStyle = element.style.cssText;
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    element.style.zIndex = "-9999";
    element.style.visibility = "visible";
    element.style.display = "block";

    // html2canvasでHTMLをキャンバスに変換
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: false, // CORSを無効化
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: element.scrollWidth || element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      logging: false, // ログを無効化
      imageTimeout: 15000, // 画像読み込みタイムアウトを設定
    });

    // 元のスタイルを復元
    element.style.cssText = originalStyle;

    const imgData = canvas.toDataURL("image/png");

    // jsPDFでPDFを作成
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth - 20; // マージン考慮
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 10;

    // 最初のページを追加
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight - 20;

    // 必要に応じてページを追加
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight - 20;
    }

    // PDFをダウンロード
    pdf.save(filename);
  } catch (error) {
    console.error("PDF生成エラー:", error);

    // より詳細なエラーメッセージを提供
    if (error instanceof Error) {
      if (error.message.includes("CORS")) {
        throw new Error(
          "画像の読み込みに失敗しました。CORSエラーが発生しています。"
        );
      } else if (error.message.includes("canvas")) {
        throw new Error("HTML要素のキャンバス変換に失敗しました。");
      } else if (error.message.includes("oklch")) {
        throw new Error("カラー関数の変換に失敗しました。");
      } else {
        throw new Error(`PDFの生成に失敗しました: ${error.message}`);
      }
    } else {
      throw new Error("PDFの生成に失敗しました");
    }
  }
}

export function generateMonthlyReportPDF(report: MonthlyReport): string {
  const { month, totalIncome, totalExpense, netAmount } = report;
  const monthName = getMonthName(month);

  let content = `
家計簿月別レポート
${monthName}

=== 収支サマリー ===
総収入: ${formatCurrency(totalIncome)}
総支出: ${formatCurrency(totalExpense)}
収支: ${formatCurrency(netAmount)}
取引件数: ${report.transactionCount}件
平均取引額: ${formatCurrency(report.averageTransactionAmount)}

=== 日平均 ===
日平均収入: ${formatCurrency(report.dailyAverages.income)}
日平均支出: ${formatCurrency(report.dailyAverages.expense)}

=== 支出カテゴリ別 ===
`;

  report.expenseByCategory.forEach((category, index) => {
    content += `${index + 1}. ${category.category}: ${formatCurrency(
      category.amount
    )} (${category.count}件)\n`;
  });

  content += `
=== 収入カテゴリ別 ===
`;

  report.incomeByCategory.forEach((category, index) => {
    content += `${index + 1}. ${category.category}: ${formatCurrency(
      category.amount
    )} (${category.count}件)\n`;
  });

  return content;
}

export function generateYearlyReportPDF(report: YearlyReport): string {
  let content = `
家計簿年間レポート
${report.year}年

=== 年間サマリー ===
年間総収入: ${formatCurrency(report.totalIncome)}
年間総支出: ${formatCurrency(report.totalExpense)}
年間収支: ${formatCurrency(report.netAmount)}
平均月収支: ${formatCurrency(report.netAmount / 12)}

=== トレンド ===
`;

  if (report.trends.incomeGrowth !== 0) {
    content += `収入成長率: ${
      report.trends.incomeGrowth >= 0 ? "+" : ""
    }${report.trends.incomeGrowth.toFixed(1)}%\n`;
  }

  if (report.trends.expenseGrowth !== 0) {
    content += `支出成長率: ${
      report.trends.expenseGrowth >= 0 ? "+" : ""
    }${report.trends.expenseGrowth.toFixed(1)}%\n`;
  }

  if (report.bestMonth) {
    content += `最高収支月: ${getMonthName(
      report.bestMonth.month
    )} (${formatCurrency(report.bestMonth.net)})\n`;
  }

  if (report.worstMonth) {
    content += `最低収支月: ${getMonthName(
      report.worstMonth.month
    )} (${formatCurrency(report.worstMonth.net)})\n`;
  }

  content += `
=== 月別収支 ===
`;

  report.monthlyData.forEach((month) => {
    if (month.income > 0 || month.expense > 0) {
      const monthName = getMonthName(month.month);
      content += `${monthName}: 収入${formatCurrency(
        month.income
      )} / 支出${formatCurrency(month.expense)} / 収支${formatCurrency(
        month.net
      )}\n`;
    }
  });

  content += `
=== 年間支出カテゴリ別 ===
`;

  report.expenseByCategory.forEach((category, index) => {
    content += `${index + 1}. ${category.category}: ${formatCurrency(
      category.amount
    )} (${category.count}件)\n`;
  });

  content += `
=== 年間収入カテゴリ別 ===
`;

  report.incomeByCategory.forEach((category, index) => {
    content += `${index + 1}. ${category.category}: ${formatCurrency(
      category.amount
    )} (${category.count}件)\n`;
  });

  return content;
}

export function downloadTextAsPDF(content: string, filename: string): void {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageHeight = pdf.internal.pageSize.getHeight();
  const lineHeight = 6;
  const margin = 20;
  const maxLinesPerPage = Math.floor((pageHeight - margin * 2) / lineHeight);

  const lines = content.split("\n");
  let currentLine = 0;

  while (currentLine < lines.length) {
    if (currentLine > 0) {
      pdf.addPage();
    }

    const endLine = Math.min(currentLine + maxLinesPerPage, lines.length);
    const pageLines = lines.slice(currentLine, endLine);

    pageLines.forEach((line, index) => {
      pdf.text(line, margin, margin + (index + 1) * lineHeight);
    });

    currentLine = endLine;
  }

  pdf.save(filename);
}
