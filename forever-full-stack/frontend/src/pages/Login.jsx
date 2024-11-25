import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("เข้าสู่ระบบ");
  const { token, setToken, navigate, backendUrl } = useContext(ShopContext);

  const [name, setName] = useState("");
  const [password, setPasword] = useState("");
  const [email, setEmail] = useState("");

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      if (currentState === "สมัครสมาชิก") {
        if (password.length < 8) {
          toast.error("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
          return;
        }

        console.log("Sending registration data:", {
          name,
          email,
          password,
        });

        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });

        console.log("Server response:", response.data);

        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("สมัครสมาชิกสำเร็จ");
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(backendUrl + "/api/user/login", {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          toast.success("เข้าสู่ระบบสำเร็จ");
        } else {
          toast.error(response.data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token]);

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
    >
      <div className="inline-flex items-center gap-2 mb-2 mt-10">
        <p className="prata-regular text-3xl">{currentState}</p>
        <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
      </div>
      {currentState === "เข้าสู่ระบบ" ? (
        ""
      ) : (
        <input
          onChange={(e) => setName(e.target.value)}
          value={name}
          type="text"
          className="w-full px-3 py-2 border border-gray-800"
          placeholder="ชื่อ"
          required
        />
      )}
      <input
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        type="email"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="อีเมล"
        required
      />
      <input
        onChange={(e) => setPasword(e.target.value)}
        value={password}
        type="password"
        className="w-full px-3 py-2 border border-gray-800"
        placeholder="รหัสผ่าน"
        required
      />
      <div className="w-full flex justify-between text-sm mt-[-8px]">
        <p className="cursor-pointer">ลืมรหัสผ่าน?</p>
        {currentState === "เข้าสู่ระบบ" ? (
          <p
            onClick={() => setCurrentState("สมัครสมาชิก")}
            className="cursor-pointer"
          >
            สมัครสมาชิก
          </p>
        ) : (
          <p
            onClick={() => setCurrentState("เข้าสู่ระบบ")}
            className="cursor-pointer"
          >
            เข้า
          </p>
        )}
      </div>
      <button className="bg-black text-white font-light px-8 py-2 mt-4">
        {currentState === "เข้าสู่ระบบ" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
      </button>
    </form>
  );
};

export default Login;
