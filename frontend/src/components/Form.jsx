import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // const name = method === "login" ? "Login" : "Register";
    const name = "Login";
    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        if (!username || !password) {
            toast.error("Username dan password harus diisi");
            setLoading(false);
            return;
        }

        try {
            const res = await api.post(route, { username, password })
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                toast.success("Login berhasil");
                navigate("/dashboard")
            } else {
                navigate("/login")
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                // Handle specific error responses
                switch (error.response.status) {
                    case 401:
                        toast.error("Username atau password salah");
                        break;
                    case 400:
                        toast.error("Data yang dimasukkan tidak valid");
                        break;
                    case 404:
                        toast.error("Server tidak ditemukan");
                        break;
                    case 500:
                        toast.error("Terjadi kesalahan pada server");
                        break;
                    default:
                        toast.error("Gagal login. Silakan coba lagi");
                }
            } else if (error.request) {
                toast.error("Tidak dapat terhubung ke server");
            } else {
                toast.error("Terjadi kesalahan. Silakan coba lagi");
            }
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="space-y-4">
        <Card className="w-[320px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">{name}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Username"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                    </div>
                    {loading && <LoadingIndicator />}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Loading..." : name}
                    </Button>
                </form>
                {method === "login" && (
                    <p className="text-sm text-gray-600 text-center mt-4">Belum punya akun? <a href="/helps" className="text-blue-600 hover:underline">Hubungi Admin</a></p>
                )}
                {/* {method === "register" && (
                     <p className="text-sm text-gray-600 text-center mt-4">
                     Sudah punya akun? <a href="/login" className="text-blue-600 hover:underline">Login disini</a>
                 </p>
                )} */}

            </CardContent>
        </Card>
        <Toaster />
        </div>
    );
}

export default Form