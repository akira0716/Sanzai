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

export async function generatePDFFromElement(
  element: HTMLElement,
  options: PDFExportOptions = {}
): Promise<void> {
  const { filename = "report.pdf", orientation = "portrait" } = options;

  try {
    // html2canvasでHTMLをキャンバスに変換
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: element.scrollWidth,
      height: element.scrollHeight,
      scrollX: 0,
      scrollY: 0,
    });

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
    throw new Error("PDFの生成に失敗しました");
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
