import { useEffect, useState } from 'react';
import { Loader, CheckCircle, XCircle } from 'lucide-react';
import authService from '../services/authService';

export default function VerifyEmailPage({ onVerified }) {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Đang xác nhận email của bạn...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const token = params.get('token');

    if (!userId || !token) {
      setStatus('error');
      setMessage('Liên kết xác nhận không hợp lệ hoặc thiếu tham số.');
      return;
    }

    const verify = async () => {
      try {
        const response = await authService.confirmEmail(userId, token);
        // apiClient returns the ApiResponse wrapper: { success, message, data }
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Email đã được xác nhận thành công! Bạn có thể đăng nhập ngay bây giờ.');
        } else {
          setStatus('error');
          setMessage(response.message || 'Xác nhận email thất bại.');
        }
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Đã xảy ra lỗi trong quá trình xác nhận. Vui lòng thử lại.');
      }
    };

    verify();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      {status === 'loading' && <Loader size={48} color="#3B82F6" className="animate-spin" />}
      {status === 'success' && <CheckCircle size={64} color="#10B981" />}
      {status === 'error' && <XCircle size={64} color="#EF4444" />}

      <h2 style={{ marginTop: '24px', fontSize: '24px', color: 'var(--text-primary)', textAlign: 'center' }}>{message}</h2>

      {status !== 'loading' && (
        <button
          onClick={onVerified}
          style={{
            marginTop: '32px',
            padding: '12px 24px',
            backgroundColor: '#3B82F6',
            color: 'white',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600'
          }}>
          Đến trang đăng nhập
        </button>
      )}
    </div>
  );
}
