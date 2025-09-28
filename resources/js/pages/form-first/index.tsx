import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Head, router, usePage } from "@inertiajs/react";
import {
    Card, CardHeader, CardTitle, CardContent, CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from "@/components/ui/select";
import {
    Table, TableHeader, TableRow, TableHead, TableBody, TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search,
} from "lucide-react";
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, User } from '@/types';

/* ================= Types ================= */

export type FirstFormRow = {
    id: number;
    meeting_date: string | null;
    full_name: string;
    age: number | null;
    phone: string;
    rayon: string;
    jamoat: string;
    selo?: string | null;
    income: string;
    agriculture_experience: string;
    plot_ha?: string | number | null;
    beekeeping: boolean;
    has_storage: boolean;
    storage_area_sqm?: number | null;
    has_refrigerator: boolean;
    created_at?: string;
    updated_at?: string;
    user:User
};


export type Paginator<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links?: Array<{ url: string | null; label: string; active: boolean }>;
};

export type Filters = {
    q?: string;
    date_from?: string;
    date_to?: string;
    sort?: "created_at" | "meeting_date" | "full_name" | "age" | "rayon" | "jamoat" | "income" | "plot_ha";
    order?: "asc" | "desc";
    per_page?: number | string;
    page?: number;
};

export type Available = {
    incomes?: string[];
    experiences?: string[];
    rayons?: string[];
    jamoats?: string[];
};

export type IndexProps = {
    forms?: Paginator<FirstFormRow>;
    firstForms?: Paginator<FirstFormRow>; // на случай старого имени пропа
    filters?: Filters;
    available?: Available;
};

/* =============== helpers =============== */

const formatDate = (s?: string | null) => (s ? new Date(s).toLocaleDateString() : "");
const yesNo = (b: boolean) => (b ? "Да" : "Нет");

// eslint-disable-next-line @typescript-eslint/no-explicit-any

const SORT_FIELDS: Array<{ value: NonNullable<Filters["sort"]>; label: string }> = [
    { value: "created_at", label: "Создано" },
    { value: "meeting_date", label: "Дата встречи" },
    { value: "full_name", label: "Ф.И.О." },
    { value: "age", label: "Возраст" },
    { value: "rayon", label: "Район" },
    { value: "jamoat", label: "Джамоат" },
    { value: "income", label: "Доход" },
    { value: "plot_ha", label: "Площадь, га" },
];
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Таблица для работниц',
        href: '/first-forms',
    },
];

const PER_PAGE = ["10", "15", "25", "50", "100"] as const;

/* =============== Component =============== */

const Index: React.FC<IndexProps> = (props) => {
    // Берём данные либо из пропсов, либо из usePage (Inertia)
    const pageProps = usePage<{ forms?: Paginator<FirstFormRow>; firstForms?: Paginator<FirstFormRow>; filters?: Filters; available?: Available }>().props;

    const serverForms = props.forms || props.firstForms || pageProps.forms || pageProps.firstForms;
    const serverFilters = props.filters || pageProps.filters || {};

    // Локальное состояние контролов
    const [q, setQ] = useState<string>(serverFilters.q ?? "");
    const [dateFrom, setDateFrom] = useState<string>(serverFilters.date_from ?? "");
    const [dateTo, setDateTo] = useState<string>(serverFilters.date_to ?? "");
    const [sort, setSort] = useState<NonNullable<Filters["sort"]>>(serverFilters.sort ?? "created_at");
    const [order, setOrder] = useState<NonNullable<Filters["order"]>>(serverFilters.order ?? "desc");
    const [perPage, setPerPage] = useState<string>(String(serverFilters.per_page ?? 15));

    // Отправка на сервер
    const submit = (patch: Partial<Filters> = {}) => {
        const payload: Filters = {
            q,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            sort,
            order,
            per_page: perPage,
            ...(patch || {}),
        };
        router.get("first-forms", payload, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Дебаунс поиска по q
    useEffect(() => {
        const t = setTimeout(() => submit({ page: 1 }), 400);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q]);

    // Даты: отправляем запрос СРАЗУ при изменении
    const onDateFromChange = (v: string) => {
        setDateFrom(v);
        submit({ date_from: v, page: 1 });
    };
    const onDateToChange = (v: string) => {
        setDateTo(v);
        submit({ date_to: v, page: 1 });
    };

    // Сортировка/порядок/размер страницы — тоже сразу
    const onChangeSort = (v: NonNullable<Filters["sort"]>) => {
        setSort(v);
        submit({ sort: v, page: 1 });
    };
    const onChangeOrder = (v: NonNullable<Filters["order"]>) => {
        setOrder(v);
        submit({ order: v, page: 1 });
    };
    const onChangePerPage = (v: string) => {
        setPerPage(v);
        submit({ per_page: v, page: 1 });
    };

    const onClear = () => {
        setQ("");
        setDateFrom("");
        setDateTo("");
        setSort("created_at");
        setOrder("desc");
        setPerPage("15");
        router.get("first-forms", {}, { preserveState: false, preserveScroll: true, replace: true });
    };

    // Пагинация
    const currentPage = serverForms?.current_page ?? 1;
    const lastPage = serverForms?.last_page ?? 1;
    const goTo = (page: number) => submit({ page });
    const goFirst = () => currentPage > 1 && goTo(1);
    const goPrev = () => currentPage > 1 && goTo(currentPage - 1);
    const goNext = () => currentPage < lastPage && goTo(currentPage + 1);
    const goLast = () => currentPage < lastPage && goTo(lastPage);

    const rows = useMemo<FirstFormRow[]>(() => serverForms?.data ?? [], [serverForms]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Таблица работниц" />
        <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    <div className="flex justify-between">
                        <div>
                            Для работниц (первая форма)
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                onClick={() => {
                                    const url = new URL("/first-forms/export/excel", window.location.origin);
                                    const params = new URLSearchParams({
                                        q: q || "",
                                        date_from: dateFrom || "",
                                        date_to: dateTo || "",
                                        sort,
                                        order,
                                    });
                                    if (perPage) params.set("per_page", perPage);
                                    url.search = params.toString();
                                    window.open(url.toString(), "_blank"); // скачать в новой вкладке
                                }}
                            >
                                Экспорт в Excel
                            </Button>

                            <Button
                                type="button"
                                onClick={() => {
                                    const url = new URL("/first-forms/export/pdf", window.location.origin);
                                    const params = new URLSearchParams({
                                        q: q || "",
                                        date_from: dateFrom || "",
                                        date_to: dateTo || "",
                                        sort,
                                        order,
                                    });
                                    url.search = params.toString();
                                    window.open(url.toString(), "_blank");
                                }}
                                variant="secondary"
                            >
                                Экспорт в PDF
                            </Button>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Фильтры */}
                <div className="grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-4">
                        <Label htmlFor="q">Поиск</Label>
                        <div className="flex gap-2">
                            <Input
                                id="q"
                                placeholder="ФИО, район, джамоат, село, телефон..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                            />
                            <Button type="button" variant="secondary" onClick={() => submit({ page: 1 })} aria-label="Искать">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="date_from">Дата от</Label>
                        <Input
                            id="date_from"
                            type="date"
                            value={dateFrom}
                            onChange={(e) => onDateFromChange(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <Label htmlFor="date_to">Дата до</Label>
                        <Input
                            id="date_to"
                            type="date"
                            value={dateTo}
                            onChange={(e) => onDateToChange(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label>Сортировать</Label>
                        <Select value={sort} onValueChange={(v) => onChangeSort(v as NonNullable<Filters["sort"]>)}>
                            <SelectTrigger><SelectValue placeholder="Поле" /></SelectTrigger>
                            <SelectContent>
                                {SORT_FIELDS.map((f) => (
                                    <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-1">
                        <Label>Порядок</Label>
                        <Select value={order} onValueChange={(v) => onChangeOrder(v as NonNullable<Filters["order"]>)}>
                            <SelectTrigger><SelectValue placeholder="Порядок" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="asc">По возрастанию</SelectItem>
                                <SelectItem value="desc">По убыванию</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-1">
                        <Label>На странице</Label>
                        <Select value={perPage} onValueChange={onChangePerPage}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {PER_PAGE.map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={onClear}>Сбросить фильтры</Button>
                </div>

                <Separator />

                {/* Таблица */}
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Дата встречи</TableHead>
                                <TableHead>Ф.И.О.</TableHead>
                                <TableHead>Возраст</TableHead>
                                <TableHead>Телефон</TableHead>
                                <TableHead>Адрес</TableHead>
                                <TableHead>Доход</TableHead>
                                <TableHead>Опыт</TableHead>
                                <TableHead>Площадь, га</TableHead>
                                <TableHead>Пчеловодство</TableHead>
                                <TableHead>Склад</TableHead>
                                <TableHead>Холод.</TableHead>
                                <TableHead>Заполнил</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rows.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={11} className="text-center text-muted-foreground">
                                        Ничего не найдено
                                    </TableCell>
                                </TableRow>
                            )}
                            {rows.map((it) => (
                                <TableRow key={it.id}>
                                    <TableCell>{formatDate(it.meeting_date)}</TableCell>
                                    <TableCell className="font-medium">{it.full_name}</TableCell>
                                    <TableCell>{it.age ?? ""}</TableCell>
                                    <TableCell>{it.phone}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{it.rayon}</div>
                                            <div className="text-muted-foreground">
                                                {it.jamoat}{it.selo ? `, ${it.selo}` : ""}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{it.income}</TableCell>
                                    <TableCell>{it.agriculture_experience}</TableCell>
                                    <TableCell>{it.plot_ha ?? ""}</TableCell>
                                    <TableCell>
                                        <Badge variant={it.beekeeping ? "default" : "secondary"}>
                                            {yesNo(it.beekeeping)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {it.has_storage ? (
                                            <Badge variant="default">
                                                Да{typeof it.storage_area_sqm === "number" ? `, ${it.storage_area_sqm} м²` : ""}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Нет</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={it.has_refrigerator ? "default" : "secondary"}>
                                            {yesNo(it.has_refrigerator)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{it.user?.name}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

            </CardContent>

            {/* Пагинация */}
            <CardFooter className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                    Стр. {serverForms?.current_page ?? 1} из {serverForms?.last_page ?? 1} — всего {serverForms?.total ?? 0}
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={goFirst} disabled={currentPage <= 1}>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goPrev} disabled={currentPage <= 1}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {(() => {
                        const pages: JSX.Element[] = [];
                        const start = Math.max(1, currentPage - 2);
                        const end = Math.min(lastPage, currentPage + 2);
                        for (let p = start; p <= end; p++) {
                            pages.push(
                                <Button key={p} variant={p === currentPage ? "default" : "outline"} onClick={() => goTo(p)}>
                                    {p}
                                </Button>
                            );
                        }
                        return pages;
                    })()}

                    <Button variant="outline" size="icon" onClick={goNext} disabled={currentPage >= lastPage}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={goLast} disabled={currentPage >= lastPage}>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
        </div>
        </AppLayout>
    );
};

export default Index;
