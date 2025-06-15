import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import LoadingIndicator from "./LoadingIndicator";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User } from 'lucide-react';

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-4">
                {/* App Logo and Name */}
                <div className="text-center mb-8">
                    <div className="inline-block p-2 bg-blue-600 rounded-lg shadow-lg mb-4">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">E-Success</h1>
                    <p className="text-gray-600 mt-2">Sistem Informasi Manajemen Akademik</p>
                </div>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">{name}</CardTitle>
                        <CardDescription className="text-center">
                            Masukkan kredensial Anda untuk mengakses sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Username"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Password"
                                        className="pl-10 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5" />
                                        ) : (
                                            <Eye className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            {loading && <LoadingIndicator />}
                            <Button 
                                type="submit" 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
                                disabled={loading}
                            >
                                {loading ? "Loading..." : name}
                            </Button>
                        </form>
                        {method === "login" && (
                            <div className="mt-6 text-center space-y-2">
                                <p className="text-sm text-gray-600">
                                    Belum punya akun? <a href="/helps" className="text-blue-600 hover:text-blue-700 font-medium">Hubungi Admin</a>
                                </p>
                                <p className="text-xs text-gray-500">
                                    Applikasi dikembangkan oleh <a href="https://www.padinusantara.co.id" className="text-blue-600 hover:text-blue-700 font-medium">Praksis Digital Nusantara</a>
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            <Toaster />
        </div>
    );
}

export default Form