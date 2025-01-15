import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date | null) => void;
  onEndDateChange: (date: Date | null) => void;
  onYesterday: () => void;
  onToday: () => void;
  onSearch: () => void;
}

export default function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onYesterday,
  onToday,
  onSearch
}: DateRangePickerProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่เริ่มต้น
          </label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            className="w-full rounded-lg border-gray-300"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันที่สิ้นสุด
          </label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            className="w-full rounded-lg border-gray-300"
            dateFormat="dd/MM/yyyy"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            onClick={onYesterday}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            เมื่อวาน
          </button>
          <button
            onClick={onToday}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            วันนี้
          </button>
          <button
            onClick={onSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i className="bi bi-search mr-2"></i>
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  );
}