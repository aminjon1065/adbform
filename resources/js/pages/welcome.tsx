import FirstForm from '@/components/firstForm';
import SecondForm from '@/components/secondForm';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Toaster } from "@/components/ui/sonner"

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;
    return (
        <>
            <Head title="Форма">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <Toaster />
            {!auth.user ? (
                <div className="flex justify-center md:justify-end">
                    <div className={'mt-5'}>
                        <Link href={'login'}>
                            <Button>Для работников ГТЛ</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="flex justify-center md:justify-end">
                    <div className={'mt-5'}>
                        <p>{auth.user.name}</p>
                        <Link href={'first-forms'}>
                            <Button>Просмотр данных</Button>
                        </Link>
                    </div>
                </div>
            )}
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex w-full max-w-md flex-col gap-6 md:max-w-max">
                    <Tabs defaultValue="account">
                        <TabsList className={'mx-auto'}>
                            <TabsTrigger value="account">Работниц </TabsTrigger>
                            <TabsTrigger value="password">
                                Руководителей
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <FirstForm />
                        </TabsContent>
                        <TabsContent value="password">
                            <SecondForm />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
