import React, { useMemo, useState } from "react";
import { useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ChevronDownIcon } from "lucide-react";
import { format, parse } from "date-fns";
import { toast } from "sonner"

/* ===== helpers & types ===== */
type VegKey = "tomato" | "pepper" | "cucumber" | "onion" | "beet" | "potato";
type GardenKey = "apricot" | "apple" | "grape" | "almond" | "persimmon" | "berries";
type IrrKey = "none" | "well" | "pump" | "canal";
type Equip = "freza" | "seeder" | "cultivator" | "other" | "";

type MarkedMap<K extends string> = Record<K, { checked: boolean; area: string }>;
type OtherEntry = { name: string; area: string };

type FormData = {
    meeting_date: string | null;
    rayon: string;
    jamoat: string;
    selo: string | null;
    accept: boolean;
    farm_name: string;
    leader_full_name: string;
    leader_age: string;
    leader_phone: string;
    farm_plot_ha: string;
    agriculture_experience: "" | "овощеводство" | "садоводство" | "пчеловодство" | "нет опыта";
    veg: MarkedMap<VegKey>;
    veg_other: OtherEntry[];
    garden: MarkedMap<GardenKey>;
    garden_other: OtherEntry[];
    equipment_choice: Equip;
    equipment_other_text: string;
    irrigation_sources: IrrKey[];
    beekeeping: boolean;
    has_storage: boolean;
    storage_area_sqm: string;
    has_refrigerator: boolean;
};

const onlyDigits = (s: string) => s.replace(/\D/g, "");
const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);
const toDecimal = (s: string | null) => (s ? s.replace(",", ".") : null);
const ymdToDate = (ymd?: string | null): Date | undefined => (ymd ? parse(ymd, "yyyy-MM-dd", new Date()) : undefined);
const formatYmdForUI = (ymd?: string | null) => {
    const dt = ymdToDate(ymd);
    return dt ? format(dt, "dd.MM.yyyy") : "";
};

const VEG_OPTIONS: Array<[string, VegKey]> = [
    ["Помидор", "tomato"],
    ["Болгарский перец", "pepper"],
    ["Огурец", "cucumber"],
    ["Лук", "onion"],
    ["Свёкла", "beet"],
    ["Картофель", "potato"],
];

const GARDEN_OPTIONS: Array<[string, GardenKey]> = [
    ["Абрикос", "apricot"],
    ["Яблоня", "apple"],
    ["Виноград", "grape"],
    ["Миндаль", "almond"],
    ["Хурма", "persimmon"],
    ["Ягодные культуры", "berries"],
];

const IRRIGATION_OPTIONS: Array<[string, IrrKey]> = [
    ["Нет", "none"],
    ["Скважина", "well"],
    ["Насос", "pump"],
    ["Канал / река", "canal"],
];

const EQUIPMENT_OPTIONS: Array<[label: string, value: Equip]> = [
    ["Фреза", "freza"],
    ["Посевная машина", "seeder"],
    ["Мотокультиватор", "cultivator"],
    ["Другое", "other"],
];

/* ===== reusable block for seeds/seedlings ===== */
function MarkedItemSection<K extends string>({
                                                 options,
                                                 data,
                                                 setItem,
                                                 label,
                                                 note,
                                                 error,
                                             }: {
    options: Array<[string, K]>;
    data: MarkedMap<K>;
    setItem: (key: K, patch: Partial<{ checked: boolean; area: string }>) => void;
    label: string;
    note: string;
    error?: string;
}) {
    return (
        <div className="grid gap-3">
            <Label>{label}</Label>
            <div className="grid md:grid-cols-2 gap-3">
                {options.map(([lbl, key]) => (
                    <div key={String(key)} className="flex items-center gap-2">
                        <Checkbox
                            id={`item_${String(key)}`}
                            checked={data[key].checked}
                            onCheckedChange={(c) => setItem(key, { checked: Boolean(c) })}
                            aria-label={`Выбрать ${lbl}`}
                        />
                        <Label htmlFor={`item_${String(key)}`} className="whitespace-nowrap">
                            {lbl}
                        </Label>
                        <Input
                            className="ml-auto"
                            placeholder="сотых"
                            value={data[key].area}
                            onChange={(e) =>
                                setItem(key, { area: e.target.value.replace(/[^\d.,]/g, "") })
                            }
                            disabled={!data[key].checked}
                            required={data[key].checked}
                            aria-label={`Площадь для ${lbl} в сотых`}
                        />
                    </div>
                ))}
            </div>
            <p className="text-sm text-muted-foreground">{note}</p>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}

/* ===== OtherEntriesSection Component ===== */
function OtherEntriesSection({
                                 entries,
                                 setEntry,
                                 error,
                             }: {
    entries: OtherEntry[];
    setEntry: (index: number, field: "name" | "area", value: string) => void;
    error?: string;
}) {
    return (
        <div className="grid gap-3">
            <Label>Другое (указать название)</Label>
            <div className="grid gap-3">
                {entries.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{idx + 1}.</span>
                        <Input
                            placeholder="название культуры"
                            value={entry.name}
                            onChange={(e) => setEntry(idx, "name", e.target.value)}
                            aria-label={`Название культуры ${idx + 1}`}
                        />
                        <Input
                            placeholder="сотых"
                            value={entry.area}
                            onChange={(e) => setEntry(idx, "area", e.target.value.replace(/[^\d.,]/g, ""))}
                            aria-label={`Площадь для культуры ${idx + 1} в сотых`}
                        />
                    </div>
                ))}
            </div>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}

/* ===== Main component ===== */
const SecondForm: React.FC = () => {
    const { data, setData, post, processing, errors, setError, reset, transform } = useForm<FormData>({
        meeting_date: null,
        rayon: "",
        jamoat: "",
        selo: "",
        accept: true,
        farm_name: "",
        leader_full_name: "",
        leader_age: "",
        leader_phone: "",
        farm_plot_ha: "",
        agriculture_experience: "",
        veg: {
            tomato: { checked: false, area: "" },
            pepper: { checked: false, area: "" },
            cucumber: { checked: false, area: "" },
            onion: { checked: false, area: "" },
            beet: { checked: false, area: "" },
            potato: { checked: false, area: "" },
        },
        veg_other: [
            { name: "", area: "" },
            { name: "", area: "" },
            { name: "", area: "" },
            { name: "", area: "" },
        ],
        garden: {
            apricot: { checked: false, area: "" },
            apple: { checked: false, area: "" },
            grape: { checked: false, area: "" },
            almond: { checked: false, area: "" },
            persimmon: { checked: false, area: "" },
            berries: { checked: false, area: "" },
        },
        garden_other: [
            { name: "", area: "" },
            { name: "", area: "" },
            { name: "", area: "" },
            { name: "", area: "" },
        ],
        equipment_choice: "",
        equipment_other_text: "",
        irrigation_sources: [],
        beekeeping: false,
        has_storage: false,
        storage_area_sqm: "",
        has_refrigerator: false,
    });

    const [openDate, setOpenDate] = useState(false);

    const anyVegChecked = useMemo(() => Object.values(data.veg).some((v) => v.checked), [data.veg]);
    const anyGardenChecked = useMemo(() => Object.values(data.garden).some((v) => v.checked), [data.garden]);

    const showVegetable = data.agriculture_experience === "овощеводство";
    const showGarden = data.agriculture_experience === "садоводство";
    const showEquipmentOther = data.equipment_choice === "other";

    const setVegItem = (key: VegKey, patch: Partial<{ checked: boolean; area: string }>) =>
        setData("veg", { ...data.veg, [key]: { ...data.veg[key], ...patch } });
    const setGardenItem = (key: GardenKey, patch: Partial<{ checked: boolean; area: string }>) =>
        setData("garden", { ...data.garden, [key]: { ...data.garden[key], ...patch } });

    const setVegOtherEntry = (index: number, field: "name" | "area", value: string) => {
        const updated = [...data.veg_other];
        updated[index] = { ...updated[index], [field]: value };
        setData("veg_other", updated);
    };

    const setGardenOtherEntry = (index: number, field: "name" | "area", value: string) => {
        const updated = [...data.garden_other];
        updated[index] = { ...updated[index], [field]: value };
        setData("garden_other", updated);
    };

    const toggleIrrigation = (key: IrrKey, checked: boolean) => {
        if (key === "none" && checked) {
            setData("irrigation_sources", ["none"]);
        } else {
            setData(
                "irrigation_sources",
                checked
                    ? [...data.irrigation_sources.filter((x) => x !== "none"), key]
                    : data.irrigation_sources.filter((x) => x !== key),
            );
        }
    };

    const resetMarked = <K extends string>(obj: MarkedMap<K>): MarkedMap<K> =>
        Object.fromEntries(Object.keys(obj).map((k) => [k, { checked: false, area: "" }])) as MarkedMap<K>;

    const onLeaderAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value;
        if (/^\d*$/.test(v)) {
            const num = Number(v);
            setData("leader_age", v === "" ? "" : String(clamp(num, 18, 100)));
        }
    };

    const validate = (): boolean => {
        let ok = true;

        if (!data.meeting_date) {
            setError("meeting_date", "Укажите дату проведения встречи.");
            ok = false;
        }
        if (!data.accept) {
            setError("accept", "Нужно согласие на участие.");
            ok = false;
        }
        if (data.leader_phone.length !== 9) {
            setError("leader_phone", "Номер телефона должен содержать ровно 9 цифр.");
            ok = false;
        }
        if (showVegetable && anyVegChecked) {
            const miss = Object.values(data.veg).some((v) => v.checked && !v.area);
            if (miss) {
                setError("seeds", "Для выбранных культур укажите площадь (сотых).");
                ok = false;
            }
        }
        if (showVegetable) {
            const vegOtherWithData = data.veg_other.filter((e) => e.name.trim() || e.area.trim());
            const vegOtherIncomplete = vegOtherWithData.some((e) => !e.name.trim() || !e.area.trim());
            if (vegOtherIncomplete) {
                setError("veg_other", "Для поля 'Другое' укажите и название культуры, и площадь.");
                ok = false;
            }
        }
        if (showGarden && anyGardenChecked) {
            const miss = Object.values(data.garden).some((v) => v.checked && !v.area);
            if (miss) {
                setError("seedlings", "Для выбранных культур укажите площадь (сотых).");
                ok = false;
            }
        }
        if (showGarden) {
            const gardenOtherWithData = data.garden_other.filter((e) => e.name.trim() || e.area.trim());
            const gardenOtherIncomplete = gardenOtherWithData.some((e) => !e.name.trim() || !e.area.trim());
            if (gardenOtherIncomplete) {
                setError("garden_other", "Для поля 'Другое' укажите и название культуры, и площадь.");
                ok = false;
            }
        }
        if (data.has_storage && !data.storage_area_sqm) {
            setError("storage_area_sqm", "Укажите площадь склада (м²).");
            ok = false;
        }
        if (!data.equipment_choice) {
            setError("equipment_choice", "Выберите вид сельскохозяйственной техники.");
            ok = false;
        }
        if (data.equipment_choice === "other" && data.equipment_other_text.trim().length < 3) {
            setError("equipment_other_text", "Укажите корректное название техники (минимум 3 символа).");
            ok = false;
        }
        return ok;
    };

    const resetForm = () => {
        reset();
        setData((d) => ({
            ...d,
            meeting_date: null,
            rayon: "",
            jamoat: "",
            selo: "",
            accept: true,
            farm_name: "",
            leader_full_name: "",
            leader_age: "",
            leader_phone: "",
            farm_plot_ha: "",
            agriculture_experience: "",
            veg: resetMarked(d.veg),
            veg_other: [
                { name: "", area: "" },
                { name: "", area: "" },
                { name: "", area: "" },
                { name: "", area: "" },
            ],
            garden: resetMarked(d.garden),
            garden_other: [
                { name: "", area: "" },
                { name: "", area: "" },
                { name: "", area: "" },
                { name: "", area: "" },
            ],
            equipment_choice: "",
            equipment_other_text: "",
            irrigation_sources: [],
            beekeeping: false,
            has_storage: false,
            storage_area_sqm: "",
            has_refrigerator: false,
        }));
        Object.keys(errors).forEach((key) => setError(key, ""));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const seeds = showVegetable
            ? [
                ...Object.entries(data.veg)
                    .filter(([, v]) => v.checked)
                    .map(([key, v]) => ({ key, area: v.area })),
                ...data.veg_other
                    .filter((e) => e.name.trim() && e.area.trim())
                    .map((e, idx) => ({ key: `other_${idx + 1}`, name: e.name, area: e.area })),
            ]
            : [];
        const seedlings = showGarden
            ? [
                ...Object.entries(data.garden)
                    .filter(([, v]) => v.checked)
                    .map(([key, v]) => ({ key, area: v.area })),
                ...data.garden_other
                    .filter((e) => e.name.trim() && e.area.trim())
                    .map((e, idx) => ({ key: `other_${idx + 1}`, name: e.name, area: e.area })),
            ]
            : [];

        transform((d) => ({
            meeting_date: d.meeting_date,
            rayon: d.rayon,
            jamoat: d.jamoat,
            selo: d.selo || null,
            accept: !!d.accept,
            farm_name: d.farm_name,
            leader_full_name: d.leader_full_name,
            leader_age: d.leader_age ? Number(d.leader_age) : null,
            leader_phone: d.leader_phone,
            farm_plot_ha: toDecimal(d.farm_plot_ha),
            agriculture_experience: d.agriculture_experience,
            seeds: seeds.length ? seeds : null,
            seedlings: seedlings.length ? seedlings : null,
            equipment_choice: d.equipment_choice,
            equipment_other_text: d.equipment_choice === "other" ? d.equipment_other_text : null,
            irrigation_sources: d.irrigation_sources,
            beekeeping: !!d.beekeeping,
            has_storage: !!d.has_storage,
            storage_area_sqm: d.has_storage ? (d.storage_area_sqm ? Number(d.storage_area_sqm) : 0) : null,
            has_refrigerator: !!d.has_refrigerator,
        }));

        post("/second-forms", {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Анкета №2 сохранена");
                resetForm();
            },
            onError: (serverErrors) => {
                toast.error(Object.values(serverErrors).join(", "), {
                    description: "Ошибка при сохранении анкеты",
                });
            },
        });
    };

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Анкета для проведения опроса по определению нужд бенефициаров, женщин – руководителей дехканских хозяйств.</CardTitle>
                    <CardDescription className="text-black dark:text-white">
                        Цель: Определение текущих потребностей женщин-фермеров для планирования дальнейших мероприятий в рамках Проекта
                        «Обеспечение устойчивых средств к существованию и расширение прав и возможностей сельских женщин», финансируемого
                        Азиатским банком развития (АБР). Опрос носит общий характер и направлен исключительно на сбор информации. Он не
                        предусматривает и не гарантирует оказание поддержки со стороны проекта.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6">
                    {/* Дата + адрес */}
                    <div className="grid gap-3">
                        <Label htmlFor="date_btn">Дата проведения встречи</Label>
                        <Popover open={openDate} onOpenChange={setOpenDate}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-between font-normal" id="date_btn">
                                    {data.meeting_date ? formatYmdForUI(data.meeting_date) : "Выбрать дату"}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={ymdToDate(data.meeting_date)}
                                    captionLayout="dropdown"
                                    onSelect={(d) => {
                                        const iso = d ? format(d, "yyyy-MM-dd") : null;
                                        setData("meeting_date", iso);
                                        setOpenDate(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.meeting_date && <p className="text-red-500">{errors.meeting_date}</p>}
                    </div>

                    <div className="grid gap-3">
                        <Label>Адрес</Label>
                        <div className="md:flex gap-2 space-y-3">
                            <Input
                                placeholder="Район"
                                value={data.rayon}
                                onChange={(e) => setData("rayon", e.target.value)}
                                aria-label="Район"
                            />
                            <Input
                                placeholder="Джамоат"
                                value={data.jamoat}
                                onChange={(e) => setData("jamoat", e.target.value)}
                                aria-label="Джамоат"
                            />
                            <Input
                                placeholder="Село"
                                value={data.selo ?? ""}
                                onChange={(e) => setData("selo", e.target.value)}
                                aria-label="Село"
                            />
                        </div>
                    </div>

                    {/* Согласие */}
                    <div className="grid gap-3">
                        <Label>Согласие на участие в опросе:</Label>
                        <RadioGroup
                            value={data.accept ? "1" : "0"}
                            onValueChange={(v) => setData("accept", v === "1")}
                            className="flex gap-6"
                            aria-label="Согласие на участие в опросе"
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="1" id="consent_yes" />
                                <Label htmlFor="consent_yes">Согласна</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="0" id="consent_no" />
                                <Label htmlFor="consent_no">Не согласна</Label>
                            </div>
                        </RadioGroup>
                        {errors.accept && <p className="text-red-500">{errors.accept}</p>}
                    </div>

                    <Separator className="my-4" />

                    {/* 1. Информация о ДХ */}
                    <div className="grid gap-3">
                        <Label>1. Информация о дехканском хозяйстве</Label>
                        <Input
                            placeholder="Название ДХ"
                            value={data.farm_name}
                            onChange={(e) => setData("farm_name", e.target.value)}
                            aria-label="Название дехканского хозяйства"
                        />
                        <div className="md:flex gap-2 space-y-3">
                            <Input
                                placeholder="Ф.И.О. руководителя ДХ"
                                value={data.leader_full_name}
                                onChange={(e) => setData("leader_full_name", e.target.value)}
                                aria-label="Ф.И.О. руководителя ДХ"
                            />
                            <Input
                                type="number"
                                min={18}
                                max={100}
                                step={1}
                                placeholder="Возраст руководителя ДХ"
                                value={data.leader_age}
                                onChange={onLeaderAgeChange}
                                aria-label="Возраст руководителя ДХ"
                            />
                            <Input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-local"
                                placeholder="Номер телефона руководителя ДХ"
                                value={data.leader_phone}
                                maxLength={9}
                                onChange={(e) => setData("leader_phone", onlyDigits(e.target.value).slice(0, 9))}
                                aria-label="Номер телефона руководителя ДХ"
                            />
                        </div>
                        {errors.leader_phone && <p className="text-red-500">{errors.leader_phone}</p>}
                    </div>

                    {/* 2. Площадь ДХ */}
                    <div className="grid gap-3">
                        <Label>2. Площадь дехканского хозяйства (га)</Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="в гектарах"
                            value={data.farm_plot_ha}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (/^\d*[.,]?\d*$/.test(value)) setData("farm_plot_ha", value);
                            }}
                            aria-label="Площадь хозяйства в гектарах"
                        />
                    </div>

                    {/* 3. Опыт */}
                    <div className="grid gap-3">
                        <Label>3. В какой отрасли сельского хозяйства у вас есть опыт?</Label>
                        <RadioGroup
                            value={data.agriculture_experience}
                            onValueChange={(v) => {
                                if (v === "овощеводство") setData("garden", resetMarked(data.garden));
                                if (v === "садоводство") setData("veg", resetMarked(data.veg));
                                setData("agriculture_experience", v as FormData["agriculture_experience"]);
                            }}
                            className="flex flex-col md:flex-row gap-3"
                            aria-label="Опыт в сельском хозяйстве"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="овощеводство" id="exp1" />
                                <Label htmlFor="exp1">в овощеводстве</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="садоводство" id="exp2" />
                                <Label htmlFor="exp2">в садоводстве</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="пчеловодство" id="exp3" />
                                <Label htmlFor="exp3">в пчеловодстве</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="нет опыта" id="exp4" />
                                <Label htmlFor="exp4">не имею опыта</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* 4. Овощеводство */}
                    {showVegetable && (
                        <>
                            <MarkedItemSection
                                options={VEG_OPTIONS}
                                data={data.veg}
                                setItem={setVegItem}
                                label="4. Если Вы выбираете «Овощеводство», отметьте семена и укажите площадь (сотых):"
                                note="Примечание: сеялка, опрыскиватель, защитная одежда, овощеводческий инвентарь."
                                error={errors.seeds}
                            />
                            <OtherEntriesSection
                                entries={data.veg_other}
                                setEntry={setVegOtherEntry}
                                error={errors.veg_other}
                            />
                        </>
                    )}

                    {/* 5. Садоводство */}
                    {showGarden && (
                        <>
                            <MarkedItemSection
                                options={GARDEN_OPTIONS}
                                data={data.garden}
                                setItem={setGardenItem}
                                label="5. Если Вы выбираете «Садоводство», отметьте саженцы и укажите площадь (сотых):"
                                note="Примечание: ручной опрыскиватель, защитная одежда, садовый инвентарь (набор)."
                                error={errors.seedlings}
                            />
                            <OtherEntriesSection
                                entries={data.garden_other}
                                setEntry={setGardenOtherEntry}
                                error={errors.garden_other}
                            />
                        </>
                    )}

                    {/* 6. Техника */}
                    <div className="grid gap-3">
                        <Label>6. Выберите один нужный Вам вид сельскохозяйственной техники</Label>
                        <RadioGroup
                            value={data.equipment_choice}
                            onValueChange={(v) => setData("equipment_choice", v as Equip)}
                            className="flex flex-col md:flex-row gap-3"
                            aria-label="Выбор сельскохозяйственной техники"
                        >
                            {EQUIPMENT_OPTIONS.map(([label, val]) => (
                                <div key={val} className="flex items-center gap-2">
                                    <RadioGroupItem value={val} id={`equip_${val}`} />
                                    <Label htmlFor={`equip_${val}`}>{label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {errors.equipment_choice && <p className="text-red-500">{errors.equipment_choice}</p>}
                        {showEquipmentOther && (
                            <Input
                                placeholder="Другое — укажите технику"
                                value={data.equipment_other_text}
                                onChange={(e) => setData("equipment_other_text", e.target.value)}
                                aria-label="Укажите другую технику"
                            />
                        )}
                        {errors.equipment_other_text && <p className="text-red-500">{errors.equipment_other_text}</p>}
                    </div>

                    {/* 7. Орошение */}
                    <div className="grid gap-3">
                        <Label>7. Укажите доступный источник орошения:</Label>
                        <div className="grid md:grid-cols-4 gap-2">
                            {IRRIGATION_OPTIONS.map(([label, key]) => (
                                <div key={key} className="flex items-center gap-2">
                                    <Checkbox
                                        id={`irr_${key}`}
                                        checked={data.irrigation_sources.includes(key)}
                                        onCheckedChange={(c) => toggleIrrigation(key, Boolean(c))}
                                        aria-label={`Источник орошения: ${label}`}
                                    />
                                    <Label htmlFor={`irr_${key}`}>{label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 8. Пчеловодство */}
                    <div className="grid gap-3">
                        <Label>8. Пчеловодство</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="beekeeping"
                                checked={data.beekeeping}
                                onCheckedChange={(c) => setData("beekeeping", Boolean(c))}
                                aria-label="Выбрать пчеловодство"
                            />
                            <Label htmlFor="beekeeping">
                                При выборе «Пчеловодство» предусматриваются ульи и стартовый комплект оборудования.
                            </Label>
                        </div>
                    </div>

                    {/* 9. Склад */}
                    <div className="grid gap-3">
                        <Label>9. Есть ли у Вас склад для хранения?</Label>
                        <RadioGroup
                            value={data.has_storage ? "Да" : "Нет"}
                            onValueChange={(v) => setData("has_storage", v === "Да")}
                            className="flex gap-6"
                            aria-label="Наличие склада"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="Да" id="wh_yes" />
                                <Label htmlFor="wh_yes">Да</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="Нет" id="wh_no" />
                                <Label htmlFor="wh_no">Нет</Label>
                            </div>
                        </RadioGroup>
                        {data.has_storage && (
                            <>
                                <Input
                                    type="number"
                                    min={0}
                                    step={1}
                                    placeholder="Площадь склада (м²)"
                                    value={data.storage_area_sqm}
                                    onChange={(e) => setData("storage_area_sqm", onlyDigits(e.target.value))}
                                    required
                                    aria-label="Площадь склада в м²"
                                />
                                {errors.storage_area_sqm && <p className="text-red-500">{errors.storage_area_sqm}</p>}
                            </>
                        )}
                    </div>

                    {/* 10. Холодильная камера */}
                    <div className="grid gap-3">
                        <Label>10. Есть ли у Вас доступ к холодильной камере?</Label>
                        <RadioGroup
                            value={data.has_refrigerator ? "Да" : "Нет"}
                            onValueChange={(v) => setData("has_refrigerator", v === "Да")}
                            className="flex gap-6"
                            aria-label="Наличие холодильной камеры"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="Да" id="fr_yes" />
                                <Label htmlFor="fr_yes">Да</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="Нет" id="fr_no" />
                                <Label htmlFor="fr_no">Нет</Label>
                            </div>
                        </RadioGroup>
                    </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                    <Button type="submit" disabled={processing}>
                        {processing ? "Сохранение..." : "Сохранить"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                        Сбросить форму
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default SecondForm;
