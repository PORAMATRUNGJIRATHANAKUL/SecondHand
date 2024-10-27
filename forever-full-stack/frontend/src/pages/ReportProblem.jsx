import React from "react";

const ReportProblem = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">แจ้งปัญหา</h1>
      <div className="space-y-4 text-sm">
        <p className="text-center mb-4">
          พบปัญหาการใช้งาน? เราพร้อมช่วยเหลือคุณ โปรดปฏิบัติตามขั้นตอนต่อไปนี้
        </p>
        <ol className="list-decimal space-y-2 pl-4">
          <li>ระบุปัญหาที่พบอย่างชัดเจน</li>
          <li>แจ้งหมายเลขคำสั่งซื้อ (ถ้ามี) หรือชื่อผู้ใช้ของคุณ</li>
          <li>เลือกช่องทางการติดต่อที่สะดวกสำหรับคุณ</li>
          <li>รอการตอบกลับจากทีมงานของเรา</li>
        </ol>
        <p className="font-semibold mt-4">ช่องทางการติดต่อ:</p>
        <ul className="list-disc space-y-2 pl-4">
          <li>อีเมล: secondhand@bumail.net</li>
          <li>โทรศัพท์: 082-815-7756 (จันทร์-ศุกร์ 9:00-18:00 น.)</li>
          <li>Line Official: SecondHand</li>
        </ul>
        <p className="text-center mt-4">
          เรามุ่งมั่นที่จะแก้ไขปัญหาของคุณอย่างรวดเร็วและมีประสิทธิภาพ
        </p>
      </div>
    </div>
  );
};

export default ReportProblem;
