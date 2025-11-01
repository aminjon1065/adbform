import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useForm } from '@inertiajs/react';
import { format, parse } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

/* ===================== Types & helpers ===================== */
type VegKey = 'tomato' | 'pepper' | 'cucumber' | 'onion' | 'beet' | 'potato';
type GardenKey =
    | 'apricot'
    | 'apple'
    | 'grape'
    | 'almond'
    | 'persimmon'
    | 'berries';
type IrrKey = 'none' | 'well' | 'pump' | 'canal';

type MarkedMap<K extends string> = Record<
    K,
    { checked: boolean; area: string }
>;
type OtherEntry = { name: string; area: string };

type FormData = {
    meeting_date: string | null;
    rayon: string;
    jamoat: string;
    selo: string | null;
    accept: boolean;
    full_name: string;
    age: string;
    phone: string;
    family_count: string;
    children_count: string;
    elderly_count: string;
    able_count: string;
    income: string[];
    income_other_text: string;
    plot_ha: string;
    agriculture_experience:
        | ''
        | 'овощеводство'
        | 'садоводство'
        | 'пчеловодство'
        | 'нет опыта';
    veg: MarkedMap<VegKey>;
    veg_other: OtherEntry[];
    garden: MarkedMap<GardenKey>;
    garden_other: OtherEntry[];
    irrigation_sources: IrrKey[];
    beekeeping: boolean;
    has_storage: boolean;
    storage_area_sqm: string;
    has_refrigerator: boolean;
};

const onlyDigits = (s: string) => s.replace(/\D/g, '');
const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);
const toDecimal = (s: string | null) => (s ? s.replace(',', '.') : null);
const ymdToDate = (ymd?: string | null): Date | undefined =>
    ymd ? parse(ymd, 'yyyy-MM-dd', new Date()) : undefined;
const formatYmdForUI = (ymd?: string | null) => {
    const dt = ymdToDate(ymd);
    return dt ? format(dt, 'dd.MM.yyyy') : '';
};

const VEG_OPTIONS: Array<[string, VegKey]> = [
    ['Помидор', 'tomato'],
    ['Болгарский перец', 'pepper'],
    ['Огурец', 'cucumber'],
    ['Лук', 'onion'],
    ['Свёкла', 'beet'],
    ['Картофель', 'potato'],
];

const GARDEN_OPTIONS: Array<[string, GardenKey]> = [
    ['Абрикос', 'apricot'],
    ['Яблоня', 'apple'],
    ['Виноград', 'grape'],
    ['Миндаль', 'almond'],
    ['Хурма', 'persimmon'],
    ['Ягодные культуры', 'berries'],
];

const IRRIGATION_OPTIONS: Array<[string, IrrKey]> = [
    ['Нет', 'none'],
    ['Скважина', 'well'],
    ['Насос', 'pump'],
    ['Канал / река', 'canal'],
];

const INCOME_OPTIONS: Array<[string, string]> = [
    ['Сельское хозяйство', 'agriculture'],
    ['Сезонные работы', 'seasonal'],
    ['Работа за рубежом', 'abroad'],
    ['Пенсия', 'pension'],
    ['Другое', 'other'],
];

/* ===================== MarkedItemSection Component ===================== */
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
    setItem: (
        key: K,
        patch: Partial<{ checked: boolean; area: string }>,
    ) => void;
    label: string;
    note: string;
    error?: string;
}) {
    return (
        <div className="grid gap-3">
            <Label>{label}</Label>
            <div className="grid gap-3 md:grid-cols-2">
                {options.map(([lbl, key]) => (
                    <div key={String(key)} className="flex items-center gap-2">
                        <Checkbox
                            id={`item_${String(key)}`}
                            checked={data[key].checked}
                            onCheckedChange={(c) =>
                                setItem(key, { checked: Boolean(c) })
                            }
                            aria-label={`Выбрать ${lbl}`}
                        />
                        <Label
                            htmlFor={`item_${String(key)}`}
                            className="whitespace-nowrap"
                        >
                            {lbl}
                        </Label>
                        <Input
                            className="ml-auto"
                            placeholder="сотых"
                            value={data[key].area}
                            onChange={(e) =>
                                setItem(key, {
                                    area: e.target.value.replace(
                                        /[^\d.,]/g,
                                        '',
                                    ),
                                })
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

/* ===================== OtherEntriesSection Component ===================== */
function OtherEntriesSection({
    entries,
    setEntry,
    addEntry,
    removeEntry,
    error,
}: {
    entries: OtherEntry[];
    setEntry: (index: number, field: 'name' | 'area', value: string) => void;
    addEntry: () => void;
    removeEntry: (index: number) => void;
    error?: string;
}) {
    return (
        <div className="grid gap-3">
            <div className="flex items-center justify-between">
                <Label>Другое (указать название)</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addEntry}
                    aria-label="Добавить культуру"
                >
                    + Добавить
                </Button>
            </div>
            <div className="grid gap-3">
                {entries.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Нажмите "+ Добавить" для добавления культуры
                    </p>
                ) : (
                    entries.map((entry, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                                {idx + 1}.
                            </span>
                            <Input
                                placeholder="название культуры"
                                value={entry.name}
                                onChange={(e) =>
                                    setEntry(idx, 'name', e.target.value)
                                }
                                aria-label={`Название культуры ${idx + 1}`}
                            />
                            <Input
                                placeholder="сотых"
                                value={entry.area}
                                onChange={(e) =>
                                    setEntry(
                                        idx,
                                        'area',
                                        e.target.value.replace(/[^\d.,]/g, ''),
                                    )
                                }
                                aria-label={`Площадь для культуры ${idx + 1} в сотых`}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeEntry(idx)}
                                aria-label={`Удалить культуру ${idx + 1}`}
                            >
                                ✕
                            </Button>
                        </div>
                    ))
                )}
            </div>
            {error && <p className="text-red-500">{error}</p>}
        </div>
    );
}

/* ===================== Main Component ===================== */
const FirstForm: React.FC = () => {
    const {
        data,
        setData,
        post,
        processing,
        errors,
        setError,
        reset,
        transform,
    } = useForm<FormData>({
        meeting_date: null,
        rayon: '',
        jamoat: '',
        selo: '',
        accept: true,
        full_name: '',
        age: '',
        phone: '',
        family_count: '',
        children_count: '',
        elderly_count: '',
        able_count: '',
        income: [],
        income_other_text: '',
        plot_ha: '',
        agriculture_experience: '',
        veg: {
            tomato: { checked: false, area: '' },
            pepper: { checked: false, area: '' },
            cucumber: { checked: false, area: '' },
            onion: { checked: false, area: '' },
            beet: { checked: false, area: '' },
            potato: { checked: false, area: '' },
        },
        veg_other: [],
        garden: {
            apricot: { checked: false, area: '' },
            apple: { checked: false, area: '' },
            grape: { checked: false, area: '' },
            almond: { checked: false, area: '' },
            persimmon: { checked: false, area: '' },
            berries: { checked: false, area: '' },
        },
        garden_other: [],
        irrigation_sources: [],
        beekeeping: false,
        has_storage: false,
        storage_area_sqm: '',
        has_refrigerator: false,
    });

    const [openDate, setOpenDate] = useState(false);

    const anyVegChecked = useMemo(
        () => Object.values(data.veg).some((v) => v.checked),
        [data.veg],
    );
    const anyGardenChecked = useMemo(
        () => Object.values(data.garden).some((v) => v.checked),
        [data.garden],
    );

    const showVegetable = data.agriculture_experience === 'овощеводство';
    const showGarden = data.agriculture_experience === 'садоводство';
    const showIncomeOther = data.income.includes('other');

    const setVegItem = (
        key: VegKey,
        patch: Partial<{ checked: boolean; area: string }>,
    ) => setData('veg', { ...data.veg, [key]: { ...data.veg[key], ...patch } });
    const setGardenItem = (
        key: GardenKey,
        patch: Partial<{ checked: boolean; area: string }>,
    ) =>
        setData('garden', {
            ...data.garden,
            [key]: { ...data.garden[key], ...patch },
        });

    const setVegOtherEntry = (
        index: number,
        field: 'name' | 'area',
        value: string,
    ) => {
        const updated = [...data.veg_other];
        updated[index] = { ...updated[index], [field]: value };
        setData('veg_other', updated);
    };

    const addVegOtherEntry = () => {
        setData('veg_other', [...data.veg_other, { name: '', area: '' }]);
    };

    const removeVegOtherEntry = (index: number) => {
        const updated = data.veg_other.filter((_, idx) => idx !== index);
        setData('veg_other', updated);
    };

    const setGardenOtherEntry = (
        index: number,
        field: 'name' | 'area',
        value: string,
    ) => {
        const updated = [...data.garden_other];
        updated[index] = { ...updated[index], [field]: value };
        setData('garden_other', updated);
    };

    const addGardenOtherEntry = () => {
        setData('garden_other', [...data.garden_other, { name: '', area: '' }]);
    };

    const removeGardenOtherEntry = (index: number) => {
        const updated = data.garden_other.filter((_, idx) => idx !== index);
        setData('garden_other', updated);
    };

    const toggleIncome = (value: string, checked: boolean) => {
        setData(
            'income',
            checked
                ? [...data.income, value]
                : data.income.filter((x) => x !== value),
        );
    };

    const toggleIrrigation = (key: IrrKey, checked: boolean) => {
        if (key === 'none' && checked) {
            setData('irrigation_sources', ['none']);
        } else {
            setData(
                'irrigation_sources',
                checked
                    ? [
                          ...data.irrigation_sources.filter(
                              (x) => x !== 'none',
                          ),
                          key,
                      ]
                    : data.irrigation_sources.filter((x) => x !== key),
            );
        }
    };

    const resetMarked = <K extends string>(obj: MarkedMap<K>): MarkedMap<K> =>
        Object.fromEntries(
            Object.keys(obj).map((k) => [k, { checked: false, area: '' }]),
        ) as MarkedMap<K>;

    const onAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
            const num = Number(value);
            const currentYear = new Date().getFullYear();
            setData('age', value === '' ? '' : String(clamp(num, 1900, currentYear)));
        }
    };

    const validate = (): boolean => {
        let valid = true;

        if (!data.meeting_date) {
            setError('meeting_date', 'Укажите дату проведения встречи.');
            valid = false;
        }
        if (!data.accept) {
            setError('accept', 'Нужно согласие на участие.');
            valid = false;
        }
        if (!data.full_name.trim()) {
            setError('full_name', 'Укажите Ф.И.О.');
            valid = false;
        }
        if (!data.age) {
            setError('age', 'Укажите год рождения.');
            valid = false;
        }
        if (data.phone.length !== 9) {
            setError('phone', 'Номер телефона должен содержать ровно 9 цифр.');
            valid = false;
        }
        if (!data.family_count) {
            setError('family_count', 'Укажите общее количество членов семьи.');
            valid = false;
        }
        if (data.income.length === 0) {
            setError('income', 'Укажите источник дохода.');
            valid = false;
        }
        if (data.income.includes('other') && !data.income_other_text.trim()) {
            setError(
                'income_other_text',
                "Укажите источник дохода для 'Другое'.",
            );
            valid = false;
        }
        if (showVegetable && anyVegChecked) {
            const miss = Object.values(data.veg).some(
                (v) => v.checked && !v.area,
            );
            if (miss) {
                // @ts-expect-error - Custom error key for display
                setError(
                    'veg_area',
                    'Для выбранных культур в овощеводстве укажите площадь (сотых).',
                );
                valid = false;
            }
        }
        if (showVegetable) {
            const vegOtherWithData = data.veg_other.filter(
                (e) => e.name.trim() || e.area.trim(),
            );
            const vegOtherIncomplete = vegOtherWithData.some(
                (e) => !e.name.trim() || !e.area.trim(),
            );
            if (vegOtherIncomplete) {
                setError(
                    'veg_other',
                    "Для поля 'Другое' укажите и название культуры, и площадь.",
                );
                valid = false;
            }
        }
        if (showGarden && anyGardenChecked) {
            const miss = Object.values(data.garden).some(
                (v) => v.checked && !v.area,
            );
            if (miss) {
                // @ts-expect-error - Custom error key for display
                setError(
                    'garden_area',
                    'Для выбранных культур в садоводстве укажите площадь (сотых).',
                );
                valid = false;
            }
        }
        if (showGarden) {
            const gardenOtherWithData = data.garden_other.filter(
                (e) => e.name.trim() || e.area.trim(),
            );
            const gardenOtherIncomplete = gardenOtherWithData.some(
                (e) => !e.name.trim() || !e.area.trim(),
            );
            if (gardenOtherIncomplete) {
                setError(
                    'garden_other',
                    "Для поля 'Другое' укажите и название культуры, и площадь.",
                );
                valid = false;
            }
        }
        if (data.has_storage && !data.storage_area_sqm) {
            setError('storage_area_sqm', 'Укажите площадь склада (м²).');
            valid = false;
        }

        return valid;
    };

    const resetForm = () => {
        reset();
        setData((d) => ({
            ...d,
            meeting_date: null,
            rayon: '',
            jamoat: '',
            selo: '',
            accept: true,
            full_name: '',
            age: '',
            phone: '',
            family_count: '',
            children_count: '',
            elderly_count: '',
            able_count: '',
            income: [],
            income_other_text: '',
            plot_ha: '',
            agriculture_experience: '',
            veg: resetMarked(d.veg),
            veg_other: [],
            garden: resetMarked(d.garden),
            garden_other: [],
            irrigation_sources: [],
            beekeeping: false,
            has_storage: false,
            storage_area_sqm: '',
            has_refrigerator: false,
        }));
        Object.keys(errors).forEach((key) => setError(key, ''));
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
                      .map((e, idx) => ({
                          key: `other_${idx + 1}`,
                          name: e.name,
                          area: e.area,
                      })),
              ]
            : [];
        const seedlings = showGarden
            ? [
                  ...Object.entries(data.garden)
                      .filter(([, v]) => v.checked)
                      .map(([key, v]) => ({ key, area: v.area })),
                  ...data.garden_other
                      .filter((e) => e.name.trim() && e.area.trim())
                      .map((e, idx) => ({
                          key: `other_${idx + 1}`,
                          name: e.name,
                          area: e.area,
                      })),
              ]
            : [];

        const incomeValue = data.income.includes('other')
            ? [
                  ...data.income.filter((i) => i !== 'other'),
                  data.income_other_text,
              ].join(', ')
            : data.income.join(', ');

        transform((d) => ({
            meeting_date: d.meeting_date,
            rayon: d.rayon,
            jamoat: d.jamoat,
            selo: d.selo || null,
            accept: !!d.accept,
            full_name: d.full_name,
            age: d.age ? Number(d.age) : null,
            phone: d.phone,
            family_count: d.family_count ? Number(d.family_count) : 0,
            children_count: d.children_count ? Number(d.children_count) : 0,
            elderly_count: d.elderly_count ? Number(d.elderly_count) : 0,
            able_count: d.able_count ? Number(d.able_count) : 0,
            income: incomeValue,
            plot_ha: toDecimal(d.plot_ha),
            agriculture_experience: d.agriculture_experience,
            seeds: seeds.length ? seeds : null,
            seedlings: seedlings.length ? seedlings : null,
            irrigation_sources: d.irrigation_sources,
            beekeeping: !!d.beekeeping,
            has_storage: !!d.has_storage,
            storage_area_sqm: d.has_storage
                ? d.storage_area_sqm
                    ? Number(d.storage_area_sqm)
                    : 0
                : null,
            has_refrigerator: !!d.has_refrigerator,
        }));

        post('/first-forms', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Анкета сохранена');
                resetForm();
            },
            onError: (serverErrors) => {
                toast.error(Object.values(serverErrors).join(', '), {
                    description: 'Ошибка при сохранении анкеты',
                });
            },
        });
    };

    return (
        <form onSubmit={onSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Анкета для проведения опроса по определению нужд
                        бенефициаров, женщин – работниц сельскохозяйственной
                        отрасли.
                    </CardTitle>
                    <CardDescription className="text-black dark:text-white">
                        Цель: Определение текущих потребностей женщин-фермеров
                        для планирования дальнейших мероприятий в рамках Проекта
                        «Обеспечение устойчивых средств к существованию и
                        расширение прав и возможностей сельских женщин»,
                        финансируемого Азиатским банком развития (АБР). Опрос
                        носит общий характер и направлен исключительно на сбор
                        информации. Он не предусматривает и не гарантирует
                        оказание поддержки со стороны проекта.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6">
                    {/* Дата проведения встречи */}
                    <div className="grid gap-3">
                        <Label htmlFor="date_btn">
                            Дата проведения встречи
                        </Label>
                        <Popover open={openDate} onOpenChange={setOpenDate}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between font-normal"
                                    id="date_btn"
                                >
                                    {data.meeting_date
                                        ? formatYmdForUI(data.meeting_date)
                                        : 'Выбрать дату'}
                                    <ChevronDownIcon />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                            >
                                <Calendar
                                    mode="single"
                                    selected={ymdToDate(data.meeting_date)}
                                    captionLayout="dropdown"
                                    onSelect={(d) => {
                                        const iso = d
                                            ? format(d, 'yyyy-MM-dd')
                                            : null;
                                        setData('meeting_date', iso);
                                        setOpenDate(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        {errors.meeting_date && (
                            <p className="text-red-500">
                                {errors.meeting_date}
                            </p>
                        )}
                    </div>

                    {/* Адрес */}
                    <div className="grid gap-3">
                        <Label>Адрес</Label>
                        <div className="gap-2 space-y-3 md:flex">
                            <Input
                                placeholder="Район"
                                value={data.rayon}
                                onChange={(e) =>
                                    setData('rayon', e.target.value)
                                }
                                aria-label="Район"
                            />
                            <Input
                                placeholder="Джамоат"
                                value={data.jamoat}
                                onChange={(e) =>
                                    setData('jamoat', e.target.value)
                                }
                                aria-label="Джамоат"
                            />
                            <Input
                                placeholder="Село"
                                value={data.selo ?? ''}
                                onChange={(e) =>
                                    setData('selo', e.target.value)
                                }
                                aria-label="Село"
                            />
                        </div>
                    </div>

                    {/* Согласие */}
                    <div className="grid gap-3">
                        <Label>Согласие на участие в опросе:</Label>
                        <span className="text-sm">
                            Я, нижеподписавшаяся, подтверждаю свою добровольную
                            готовность принять участие в данном опросе…
                        </span>
                        <RadioGroup
                            value={data.accept ? '1' : '0'}
                            onValueChange={(v) => setData('accept', v === '1')}
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
                        {errors.accept && (
                            <p className="text-red-500">{errors.accept}</p>
                        )}
                    </div>

                    <Separator className="my-4" />

                    {/* 1. Информация об участнике */}
                    <div className="grid gap-3">
                        <Label>1. Информация об участнике опроса</Label>
                        <div className="gap-2 space-y-3 md:flex">
                            <Input
                                placeholder="Ф.И.О."
                                value={data.full_name}
                                onChange={(e) =>
                                    setData('full_name', e.target.value)
                                }
                                aria-label="Ф.И.О."
                            />
                            <Input
                                type="text"
                                placeholder="Год рождения"
                                onChange={onAgeChange}
                                aria-label="Год рождения"
                                maxLength={4}
                            />
                            <Input
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-local"
                                placeholder="Номер телефона"
                                value={data.phone}
                                maxLength={9}
                                onChange={(e) =>
                                    setData(
                                        'phone',
                                        onlyDigits(e.target.value).slice(0, 9),
                                    )
                                }
                                aria-label="Номер телефона"
                            />
                        </div>
                        {errors.full_name && (
                            <p className="text-red-500">{errors.full_name}</p>
                        )}
                        {errors.age && (
                            <p className="text-red-500">{errors.age}</p>
                        )}
                        {errors.phone && (
                            <p className="text-red-500">{errors.phone}</p>
                        )}
                    </div>

                    {/* 2. Семья */}
                    <div className="grid gap-3">
                        <Label>2. Общее количество членов семьи</Label>
                        <div className="gap-2 space-y-3 md:flex">
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="Всего"
                                value={data.family_count}
                                onChange={(e) =>
                                    setData(
                                        'family_count',
                                        onlyDigits(e.target.value),
                                    )
                                }
                                aria-label="Всего членов семьи"
                            />
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="Дети"
                                value={data.children_count}
                                onChange={(e) =>
                                    setData(
                                        'children_count',
                                        onlyDigits(e.target.value),
                                    )
                                }
                                aria-label="Количество детей"
                            />
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="Пожилые"
                                value={data.elderly_count}
                                onChange={(e) =>
                                    setData(
                                        'elderly_count',
                                        onlyDigits(e.target.value),
                                    )
                                }
                                aria-label="Количество пожилых"
                            />
                            <Input
                                type="number"
                                min={0}
                                step={1}
                                placeholder="Трудоспособные"
                                value={data.able_count}
                                onChange={(e) =>
                                    setData(
                                        'able_count',
                                        onlyDigits(e.target.value),
                                    )
                                }
                                aria-label="Количество трудоспособных"
                            />
                        </div>
                        {errors.family_count && (
                            <p className="text-red-500">
                                {errors.family_count}
                            </p>
                        )}
                    </div>

                    {/* 3. Доход */}
                    <div className="grid gap-3">
                        <Label>3. Основной источник дохода семьи</Label>
                        <div className="flex flex-col gap-3 md:flex-row">
                            {INCOME_OPTIONS.map(([label, value]) => (
                                <div
                                    key={value}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        id={`income_${value}`}
                                        checked={data.income.includes(value)}
                                        onCheckedChange={(c) =>
                                            toggleIncome(value, Boolean(c))
                                        }
                                        aria-label={`Источник дохода: ${label}`}
                                    />
                                    <Label htmlFor={`income_${value}`}>
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {errors.income && (
                            <p className="text-red-500">{errors.income}</p>
                        )}
                        {showIncomeOther && (
                            <Input
                                placeholder="Если другое — укажите"
                                value={data.income_other_text}
                                onChange={(e) =>
                                    setData('income_other_text', e.target.value)
                                }
                                aria-label="Укажите другой источник дохода"
                            />
                        )}
                        {errors.income_other_text && (
                            <p className="text-red-500">
                                {errors.income_other_text}
                            </p>
                        )}
                    </div>

                    {/* 4. Площадь участка */}
                    <div className="grid gap-3">
                        <Label>
                            4. Масоҳати умумии замини наздиҳавлигӣ, сотых
                        </Label>
                        <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="в сотых"
                            value={data.plot_ha}
                            onChange={(e) => {
                                const value = e.target.value;
                                setData(
                                    'plot_ha',
                                    value.replace(/[^\d.,]/g, ''),
                                );
                            }}
                            aria-label="Площадь участка в сотых"
                        />
                        {errors.plot_ha && (
                            <p className="text-red-500">{errors.plot_ha}</p>
                        )}
                    </div>

                    {/* 5. Опыт */}
                    <div className="grid gap-3">
                        <Label>
                            5. В какой отрасли сельского хозяйства у вас есть
                            опыт?
                        </Label>
                        <RadioGroup
                            value={data.agriculture_experience}
                            onValueChange={(v) => {
                                if (v === 'овощеводство')
                                    setData('garden', resetMarked(data.garden));
                                if (v === 'садоводство')
                                    setData('veg', resetMarked(data.veg));
                                setData(
                                    'agriculture_experience',
                                    v as FormData['agriculture_experience'],
                                );
                            }}
                            className="flex flex-col gap-3 md:flex-row"
                            aria-label="Опыт в сельском хозяйстве"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="овощеводство"
                                    id="exp1"
                                />
                                <Label htmlFor="exp1">в овощеводстве</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="садоводство" id="exp2" />
                                <Label htmlFor="exp2">в садоводстве</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="пчеловодство"
                                    id="exp3"
                                />
                                <Label htmlFor="exp3">в пчеловодстве</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem value="нет опыта" id="exp4" />
                                <Label htmlFor="exp4">не имею опыта</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* 6. Овощеводство */}
                    {showVegetable && (
                        <>
                            <MarkedItemSection
                                options={VEG_OPTIONS}
                                data={data.veg}
                                setItem={setVegItem}
                                label="6. Если Вы выбираете направление «Овощеводство», отметьте нужные семена и укажите площадь (сотых):"
                                note="Примечание: В пакет входят сеялка, опрыскиватель, защитная спецодежда, овощеводческий инвентарь."
                                error={(errors as any).veg_area}
                            />
                            <OtherEntriesSection
                                entries={data.veg_other}
                                setEntry={setVegOtherEntry}
                                addEntry={addVegOtherEntry}
                                removeEntry={removeVegOtherEntry}
                                error={errors.veg_other}
                            />
                        </>
                    )}

                    {/* 7. Садоводство */}
                    {showGarden && (
                        <>
                            <MarkedItemSection
                                options={GARDEN_OPTIONS}
                                data={data.garden}
                                setItem={setGardenItem}
                                label="7. Если Вы выбираете направление «Садоводство», отметьте нужные саженцы и укажите площадь (сотых):"
                                note="Примечание: В пакет входят ручной опрыскиватель, защитная спецодежда, садовый инвентарь (набор)."
                                error={(errors as any).garden_area}
                            />
                            <OtherEntriesSection
                                entries={data.garden_other}
                                setEntry={setGardenOtherEntry}
                                addEntry={addGardenOtherEntry}
                                removeEntry={removeGardenOtherEntry}
                                error={errors.garden_other}
                            />
                        </>
                    )}

                    {/* 8. Орошение */}
                    <div className="grid gap-3">
                        <Label>8. Укажите доступный источник орошения:</Label>
                        <div className="grid gap-2 md:grid-cols-4">
                            {IRRIGATION_OPTIONS.map(([label, key]) => (
                                <div
                                    key={key}
                                    className="flex items-center gap-2"
                                >
                                    <Checkbox
                                        id={`irr_${key}`}
                                        checked={data.irrigation_sources.includes(
                                            key,
                                        )}
                                        onCheckedChange={(c) =>
                                            toggleIrrigation(key, Boolean(c))
                                        }
                                        aria-label={`Источник орошения: ${label}`}
                                    />
                                    <Label htmlFor={`irr_${key}`}>
                                        {label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 9. Пчеловодство */}
                    <div className="grid gap-3">
                        <Label>9. Пчеловодство</Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="beekeeping"
                                checked={data.beekeeping}
                                onCheckedChange={(c) =>
                                    setData('beekeeping', Boolean(c))
                                }
                                aria-label="Выбрать пчеловодство"
                            />
                            <Label htmlFor="beekeeping">
                                Если Вы выбираете «Пчеловодство»,
                                предусматриваются ульи и стартовый комплект
                                оборудования.
                            </Label>
                        </div>
                    </div>

                    {/* 10. Склад */}
                    <div className="grid gap-3">
                        <Label>10. Есть ли у Вас склад для хранения?</Label>
                        <RadioGroup
                            value={data.has_storage ? 'Да' : 'Нет'}
                            onValueChange={(v) =>
                                setData('has_storage', v === 'Да')
                            }
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
                                    onChange={(e) =>
                                        setData(
                                            'storage_area_sqm',
                                            onlyDigits(e.target.value),
                                        )
                                    }
                                    required
                                    aria-label="Площадь склада в м²"
                                />
                                {errors.storage_area_sqm && (
                                    <p className="text-red-500">
                                        {errors.storage_area_sqm}
                                    </p>
                                )}
                            </>
                        )}
                    </div>

                    {/* 11. Холодильная камера */}
                    <div className="grid gap-3">
                        <Label>
                            11. Есть ли у Вас доступ к холодильной камере?
                        </Label>
                        <RadioGroup
                            value={data.has_refrigerator ? 'Да' : 'Нет'}
                            onValueChange={(v) =>
                                setData('has_refrigerator', v === 'Да')
                            }
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
                        {processing ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                        Сбросить форму
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default FirstForm;
