import { DailyMetrics, formatRON, formatPercentage } from './dailyMetrics.server';

export function generateDailyReportEmail(metrics: DailyMetrics[]): string {
  const currentDate = new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const tableRows = metrics.map(m => `
    <tr style="border-bottom: 1px solid #374151;">
      <td style="padding: 16px 12px; text-align: left; font-weight: 500;">${m.showroomName}</td>
      <td style="padding: 16px 12px; text-align: center;">${m.visitorsToday}</td>
      <td style="padding: 16px 12px; text-align: center;">${formatPercentage(m.conversionRateToday)}</td>
      <td style="padding: 16px 12px; text-align: right;">${formatRON(m.avgNewOrderValue)}</td>
      <td style="padding: 16px 12px; text-align: right;">${formatRON(m.advancePaymentsToday)}</td>
      <td style="padding: 16px 12px; text-align: right;">${formatRON(m.salesInvoicedToday)}</td>
      <td style="padding: 16px 12px; text-align: right;">${formatRON(m.salesInvoicedMonthToDate)}</td>
      <td style="padding: 16px 12px; text-align: right;">${formatRON(m.monthlyTarget)}</td>
      <td style="padding: 16px 12px; text-align: right; font-weight: 600;">${formatPercentage(m.targetAchievementPercentage)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Raport Zilnic</title></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f3f4f6;">
<div style="max-width:1200px;margin:0 auto;padding:40px 20px;">
  <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:12px;padding:32px;margin-bottom:24px;">
    <h1 style="margin:0 0 8px 0;color:#fff;font-size:28px;font-weight:700;">Raport Zilnic Showroom</h1>
    <p style="margin:0;color:#e0e7ff;font-size:16px;">${currentDate}</p>
  </div>
  <div style="background-color:#fff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);overflow:hidden;">
    <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:1000px;">
        <thead>
          <tr style="background-color:#1f2937;color:#fff;">
            <th style="padding:16px 12px;text-align:left;font-weight:600;font-size:13px;text-transform:uppercase;">Nume Magazin</th>
            <th style="padding:16px 12px;text-align:center;font-weight:600;font-size:13px;text-transform:uppercase;">Vizitatori (Azi)</th>
            <th style="padding:16px 12px;text-align:center;font-weight:600;font-size:13px;text-transform:uppercase;">Rată Conversie</th>
            <th style="padding:16px 12px;text-align:right;font-weight:600;font-size:13px;text-transform:uppercase;">Val. Medie Cmd.</th>
            <th style="padding:16px 12px;text-align:right;font-weight:600;font-size:13px;text-transform:uppercase;">Încasări Avansuri</th>
            <th style="padding:16px 12px;text-align:right;font-weight:600;font-size:13px;text-transform:uppercase;">Vânzări Fact. Azi</th>
            <th style="padding:16px 12px;text-align:right;font-weight:600;font-size:13px;text-transform:uppercase;">Vânzări Fact. La Zi</th>
            <th style="padding:16px 12px;text-align:right;font-weight:600;font-size:13px;text-transform:uppercase;">Target Lunar</th>
            <th style="padding:16px 12px;text-align:right;font-weight:600;font-size:13px;text-transform:uppercase;">Realizare Target</th>
          </tr>
        </thead>
        <tbody style="background-color:#1f2937;color:#e5e7eb;">${tableRows}</tbody>
      </table>
    </div>
  </div>
  <div style="margin-top:32px;padding:24px;background-color:#fff;border-radius:12px;">
    <p style="margin:0 0 8px 0;color:#6b7280;font-size:14px;"><strong>Notă:</strong> Raport generat automat din sistem.</p>
    <p style="margin:0;color:#9ca3af;font-size:13px;">Naturen &copy; ${new Date().getFullYear()}</p>
  </div>
</div>
</body>
</html>`.trim();
}

export function generateDailyReportEmailPlainText(metrics: DailyMetrics[]): string {
  const currentDate = new Date().toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const rows = metrics.map(m =>
    [m.showroomName.padEnd(15), m.visitorsToday.toString().padStart(10), formatPercentage(m.conversionRateToday).padStart(12),
     formatRON(m.avgNewOrderValue).padStart(18), formatRON(m.advancePaymentsToday).padStart(18),
     formatRON(m.salesInvoicedToday).padStart(20), formatRON(m.salesInvoicedMonthToDate).padStart(20),
     formatRON(m.monthlyTarget).padStart(18), formatPercentage(m.targetAchievementPercentage).padStart(20)].join(' | ')
  ).join('\n');

  return `RAPORT ZILNIC SHOWROOM\n${currentDate}\n\n${rows}\n\nNaturen © ${new Date().getFullYear()}`.trim();
}
