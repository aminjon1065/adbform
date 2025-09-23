import FirstForm from '@/components/firstForm';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Welcome">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <div className="flex w-full max-w-md md:max-w-max flex-col gap-6">
                    <Tabs defaultValue="account">
                        <TabsList className={"mx-auto"}>
                            <TabsTrigger value="account">Работниц </TabsTrigger>
                            <TabsTrigger value="password">Руководителей</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <FirstForm />
                        </TabsContent>
                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>
                                        Change your password here. After saving,
                                        you&apos;ll be logged out.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="tabs-demo-current">
                                            Current password
                                        </Label>
                                        <Input
                                            id="tabs-demo-current"
                                            type="password"
                                        />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="tabs-demo-new">
                                            New password
                                        </Label>
                                        <Input
                                            id="tabs-demo-new"
                                            type="password"
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save password</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
}
