
import { Footer } from '@/components/layout/Footer'
import Header from '@/components/layout/Header'
import UserSidebar from '@/components/layout/UserSidebar';
import { Tabs } from '@/components/ui/tabs';


const LayoutUser = ({ children }: { children: React.ReactNode }) => {
    const path = "/user/profile"
    return (
        <>
            <Header />
            <div className='min-w-screen min-h-150 pt-14 px-4 lg:px-20'>
                <Tabs defaultValue={path.split('/').pop() || 'profile'} orientation='vertical'>
                    <UserSidebar />
                    <div className='bg-card  rounded-lg w-full h-full'>
                        {children}
                    </div>

                </Tabs>
            </div>
            <Footer />
        </>

    )
}

export default LayoutUser
