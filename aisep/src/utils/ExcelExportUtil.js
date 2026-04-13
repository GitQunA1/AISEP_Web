import * as XLSX from 'xlsx';

/**
 * Utility for exporting data to professional Excel files
 */
const ExcelExportUtil = {
  /**
   * Exports a list of monthly payouts to an Excel file
   * @param {Array} items List of payout items
   * @param {Object} batchInfo Information about the batch (Month/Year)
   */
  exportPayoutBatch(items, batchInfo) {
    if (!items || items.length === 0) {
      console.warn('No items to export');
      return;
    }

    // 1. Format the data for Excel
    const data = items.map((item, index) => ({
      'STT': index + 1,
      'Cố vấn': item.advisorName,
      'Mã Advisor': item.advisorId,
      'Số tiền (VND)': item.amount,
      'Trạng thái': this._translateStatus(item.status),
      'Ngân hàng': item.bankName,
      'Số tài khoản': item.accountNumber,
      'Chủ tài khoản': item.accountHolderName,
      'Ngày tạo': item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : '',
      'Ngày thanh toán': item.paidAt ? new Date(item.paidAt).toLocaleDateString('vi-VN') : '',
      'Ghi chú': item.note || '',
      'Lý do từ chối': item.rejectReason || ''
    }));

    // 2. Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // 3. Set column widths
    const wscols = [
      { wch: 5 },  // STT
      { wch: 20 }, // Advisor Name
      { wch: 12 }, // Advisor ID
      { wch: 15 }, // Amount
      { wch: 15 }, // Status
      { wch: 25 }, // Bank Name
      { wch: 20 }, // Account Number
      { wch: 25 }, // Holder Name
      { wch: 15 }, // Created At
      { wch: 15 }, // Paid At
      { wch: 30 }, // Note
      { wch: 30 }  // Reject Reason
    ];
    ws['!cols'] = wscols;

    // 4. Create workbook and append worksheet
    const wb = XLSX.utils.book_new();
    const sheetName = `Thanh toán T${batchInfo.month}-${batchInfo.year}`;
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách chi trả');

    // 5. Generate filename and download
    const filename = `AISEP_Payout_Batch_${batchInfo.month}_${batchInfo.year}_${new Date().getTime()}.xlsx`;
    XLSX.writeFile(wb, filename);
  },

  _translateStatus(status) {
    const mapping = {
      'Pending': 'Chờ thanh toán',
      'Approved': 'Đã duyệt',
      'Paid': 'Đã chi trả',
      'Rejected': 'Bị từ chối'
    };
    return mapping[status] || status;
  }
};

export default ExcelExportUtil;
