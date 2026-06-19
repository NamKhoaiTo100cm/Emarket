"use client"
import { registerAction } from "@/actions/auth.action"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useActionState, useEffect } from "react"

const RegisterPage = () => {
    const [state, action, isPending] = useActionState(registerAction, null)
    useEffect(() => {
        if (state?.error) {
            toast.error(state.error)
        }
    }, [state])
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Tạo tài khoản</CardTitle>
                    <CardDescription>
                        Nhập thông tin dưới đây để tạo tài khoản
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={action}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="name">Họ tên</FieldLabel>
                                <Input id="name" name="name" type="text" placeholder="Nguyễn Văn A" required />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="m@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
                                <Input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    placeholder="0123456789"
                                    autoComplete="email"
                                    required
                                />
                            </Field>
                            <Field>
                                <Field className="grid grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                                        <Input id="password" name="password" type="password" autoComplete="new-password" required />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="confirm-password">
                                            Xác nhận mật khẩu
                                        </FieldLabel>
                                        <Input id="confirm-password" autoComplete="new-password" name="confirmPassword" type="password" required />
                                    </Field>
                                </Field>
                                <FieldDescription>
                                    Phải ít nhất 6 ký tự
                                </FieldDescription>
                            </Field>
                            <Field>
                                <Button type="submit">Tạo tài khoản</Button>
                                <FieldDescription className="text-center">
                                    Bạn đã có tài khoản? <Link href={"login"}>Đăng nhập</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
            <FieldDescription className="px-6 text-center">
                Bằng việc nhấp vào "Tạo tài khoản", bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
                và <a href="#">Chính sách bảo mật</a> của chúng tôi.
            </FieldDescription>
        </div>
    )
}

export default RegisterPage