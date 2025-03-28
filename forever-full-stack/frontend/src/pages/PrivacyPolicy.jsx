import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6 text-center">
        นโยบายความเป็นส่วนตัว
      </h1>
      <div className="space-y-4 text-sm">
        <p className="text-center">
          เราให้ความสำคัญกับความเป็นส่วนตัวของคุณ
          โปรดอ่านนโยบายความเป็นส่วนตัวต่อไปนี้เพื่อทำความเข้าใจวิธีที่เราจัดการข้อมูลคุณ
        </p>
        <ol className="list-decimal space-y-2 pl-4">
          <li>
            <strong>การเก็บรวบรวมข้อมูล:</strong>{" "}
            เราเก็บข้อมูลส่วนบุคคลที่คุณให้เราโดยตรง เช่น ชื่อ อีเมล
            และข้อมูลการติดต่อ
          </li>
          <li>
            <strong>การใช้ข้อมูล:</strong> เราใช้ข้อมูลของคุณเพื่อให้บริการ
            ปรับปรุงประสบการณ์การใช้งาน และติดต่อสื่อสารกับคุณ
          </li>
          <li>
            <strong>การแบ่งปันข้อมูล:</strong>{" "}
            เราไม่ขายหรือให้เช่าข้อมูลส่วนบุคคลของคุณแก่บุคคลที่สาม
            ยกเว้นในกรณีที่จำเป็นเพื่อให้บริการ
          </li>
          <li>
            <strong>ความปลอดภัยของข้อมูล:</strong>{" "}
            เราใช้มาตรการรักษาความปลอดภัยที่เหมาะสมเพื่อปกป้องข้อมูลของคุณจากการเข้าถึง
            การเปิดเผย การเปลี่ยนแปลง หรือการทำลายโดยไม่ได้รับอนุญาต
          </li>
          <li>
            <strong>คุกกี้และเทคโนโลยีการติดตาม:</strong>{" "}
            เราใช้คุกกี้และเทคโนโลยีการติดตามอื่นๆ
            เพื่อปรับปรุงประสบการณ์การใช้งานของคุณ
          </li>
          <li>
            <strong>สิทธิ์ของผู้ใช้:</strong> คุณมีสิทธิ์ในการเข้าถึง แก้ไข ลบ
            หรือจำกัดการใช้ข้อมูลส่วนบุคคลของคุณ
          </li>
          <li>
            <strong>การเปลี่ยนแปลงนโยบาย:</strong>{" "}
            เราอาจปรับปรุงนโยบายความเป็นส่วนตัวเป็นครั้งคราว
            และจะแจ้งให้คุณทราบเมื่อมีการเปลี่ยนแปลงที่สำคัญ
          </li>
          <li>
            <strong>การยินยอม:</strong>{" "}
            การใช้บริการของเราถือว่าคุณยินยอมให้เราจัดการข้อมูลของคุณตามนโยบายนี้
          </li>
          <li>
            <strong>การติดต่อ:</strong>{" "}
            หากคุณมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัวของเรา โปรดติดต่อเราที่
            [อีเมลหรือช่องทางการติดต่อ]
          </li>
        </ol>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
