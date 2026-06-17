"use client"

import { Suspense, useEffect } from "react"
import { loginAction } from '@/actions/auth.action'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { authService } from '@/services/auth.service'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useActionState } from 'react'

const LoginContent = () => {
  const [stateLogin, actionLogin, isPending] = useActionState(loginAction, null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (error === "unauthorized") {
      alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.")
    }
  }, [error])

  const login = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    const password = formData.get("password")

    try {
      const res = await authService.login(String(email), String(password));

      if (res.statusCode !== 201) {
        alert(res.message)
        return
      }

      await queryClient.fetchQuery({
        queryKey: ['me'],
        queryFn: () =>
          authService.getMe()
            .then(res => res.data),
      });

      window.location.href = "/";
    } catch (error) {
      alert(error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Đăng nhập</CardTitle>
          <CardDescription>
            Đăng nhập tài khoản
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={login}>
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/google`;
                  }}
                >
                  Đăng nhập bằng Google
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Hoặc
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>

              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                  {/* <a
                    href="#"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Quên mật khẩu?
                  </a> */}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </Field>

              <Field>
                <Button type="submit">Đăng nhập</Button>
                <FieldDescription className="text-center">
                  Chưa có tài khoản? <Link href="/register">Đăng ký</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* <FieldDescription className="px-6 text-center">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a>{" "}
        và <a href="#">Chính sách bảo mật</a>.
      </FieldDescription> */}
    </div>
  )
}

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <LoginContent />
    </Suspense>
  )
}

export default LoginPage