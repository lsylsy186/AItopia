import React, { useEffect, useState } from 'react';
import { getMeta } from '@/constants';
import Image from 'next/image';

export const metadata = {
  title: '登陆页',
  description: '',
};

export default function Contact() {
  const [obj, setObj] = useState<any>({ qrcode: '', wechat: '' });

  useEffect(() => {
    const meta = getMeta(window.location.href || '');
    const { wechat, qrcode } = meta;
    setObj({ wechat, qrcode });
  }, []);

  return (
    <section className="h-screen bg-gradient-to-b from-gray-100 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Page header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h1 className="h4">
              支付功能正在对接中，购买算力请扫描二维码添加管理员，或直接添加管理员微信：{obj?.wechat}
            </h1>
          </div>
          <div className="max-w-sm mx-auto">
            <Image priority src={obj?.qrcode || ''} alt="qrcode" width={300} height={300} />
            {/* <span className="pt-5">管理员微信：{obj?.wechat}</span> */}
          </div>
        </div>
      </div>
    </section>
  );
}
