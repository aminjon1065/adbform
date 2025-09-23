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
import { ChevronDownIcon } from 'lucide-react';
import React, { useMemo, useState } from 'react';

type Marked = Record<string, { checked: boolean; area: string }>;
const onlyDigits = (s: string) => s.replace(/\D/g, '');
const clamp = (n: number, min: number, max: number) =>
    Math.min(Math.max(n, min), max);

type FormData = {
    meeting_date: string | null;

    rayon: string;
    jamoat: string;
    selo: string | null;

    accept: boolean;

    full_name: string;
    age: string; // держим строкой в инпуте
    phone: string; // ровно 9 цифр

    family_count: string;
    children_count: string;
    elderly_count: string;
    able_count: string;

    income: string;

    plot_ha: string; // строкой; на сервере приведёшь к decimal

    agriculture_experience: string; // "овощеводство" | "садоводство" | "пчеловодство" | "нет опыта"

    veg: Marked;
    garden: Marked;

    irrigation_sources: string[]; // ["none","well","pump","canal"]

    beekeeping: boolean;

    has_storage: boolean;
    storage_area_sqm: string;

    has_refrigerator: boolean;
};

const FirstForm: React.FC = () => {
    const { data, setData, post, processing } = useForm<FormData>({
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

        income: '',

        plot_ha: '',

        agriculture_experience: '',

        veg: {
            tomato: { checked: false, area: '' },
            pepper: { checked: false, area: '' },
            cucumber: { checked: false, area: '' },
            onion: { checked: false, area: '' },
            beet: { checked: false, area: '' },
            potato: { checked: false, area: '' },
            other: { checked: false, area: '' },
        },

        garden: {
            apricot: { checked: false, area: '' },
            apple: { checked: false, area: '' },
            grape: { checked: false, area: '' },
            almond: { checked: false, area: '' },
            persimmon: { checked: false, area: '' },
            berries: { checked: false, area: '' },
            other: { checked: false, area: '' },
        },

        irrigation_sources: [],
        beekeeping: false,

        has_storage: false,
        storage_area_sqm: '',

        has_refrigerator: false,
    });

    // UI для календаря
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

    const setVegItem = (
        key: keyof FormData['veg'],
        patch: Partial<{ checked: boolean; area: string }>,
    ) => setData('veg', { ...data.veg, [key]: { ...data.veg[key], ...patch } });

    const setGardenItem = (
        key: keyof FormData['garden'],
        patch: Partial<{ checked: boolean; area: string }>,
    ) =>
        setData('garden', {
            ...data.garden,
            [key]: { ...data.garden[key], ...patch },
        });

    const toggleIrrigation = (key: string, checked: boolean) => {
        setData(
            'irrigation_sources',
            checked
                ? Array.from(new Set([...data.irrigation_sources, key]))
                : data.irrigation_sources.filter((x) => x !== key),
        );
    };

    const resetMarked = (obj: Marked): Marked =>
        Object.fromEntries(
            Object.keys(obj).map((k) => [k, { checked: false, area: '' }]),
        ) as Marked;

    const onAgeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.currentTarget.value;
        if (v !== '') v = String(clamp(Number(v), 1, 100));
        setData('age', v);
    };

    const onSubmit = (e: React.FormEvent) => {
        console.log('data: ', data);
        e.preventDefault();

        if (!data.meeting_date) {
            alert('Укажите дату проведения встречи.');
            return;
        }
        if (!data.accept) {
            alert('Нужно согласие на участие.');
            return;
        }
        if (data.phone.length !== 9) {
            alert('Номер телефона должен содержать ровно 9 цифр.');
            return;
        }
        if (showVegetable && anyVegChecked) {
            for (const v of Object.values(data.veg)) {
                if (v.checked && !v.area) {
                    alert(
                        'Для выбранных культур в овощеводстве укажите площадь (га).',
                    );
                    return;
                }
            }
        }
        if (showGarden && anyGardenChecked) {
            for (const v of Object.values(data.garden)) {
                if (v.checked && !v.area) {
                    alert(
                        'Для выбранных культур в садоводстве укажите площадь (га).',
                    );
                    return;
                }
            }
        }
        if (data.has_storage && !data.storage_area_sqm) {
            alert('Укажите площадь склада (м²).');
            return;
        }

        // Сбор значений под БД
        const seeds = showVegetable
            ? Object.entries(data.veg)
                  .filter(([, v]) => v.checked)
                  .map(([key, v]) => ({ key, area: v.area }))
            : [];
        const seedlings = showGarden
            ? Object.entries(data.garden)
                  .filter(([, v]) => v.checked)
                  .map(([key, v]) => ({ key, area: v.area }))
            : [];

        const payload = {
            meeting_date: data.meeting_date, // YYYY-MM-DD

            rayon: data.rayon,
            jamoat: data.jamoat,
            selo: data.selo || null,

            accept: !!data.accept,

            full_name: data.full_name,
            age: data.age ? Number(data.age) : null,
            phone: data.phone,

            family_count: data.family_count ? Number(data.family_count) : 0,
            children_count: data.children_count
                ? Number(data.children_count)
                : 0,
            elderly_count: data.elderly_count ? Number(data.elderly_count) : 0,
            able_count: data.able_count ? Number(data.able_count) : 0,

            income: data.income,

            plot_ha: data.plot_ha ? data.plot_ha.replace(',', '.') : null,

            agriculture_experience: data.agriculture_experience,

            seeds: seeds.length ? seeds : null,
            seedlings: seedlings.length ? seedlings : null,

            irrigation_sources: data.irrigation_sources,

            beekeeping: !!data.beekeeping,

            has_storage: !!data.has_storage,
            storage_area_sqm: data.has_storage
                ? data.storage_area_sqm
                    ? Number(data.storage_area_sqm)
                    : 0
                : null,

            has_refrigerator: !!data.has_refrigerator,
        };
        console.log('payload: ', payload);
        post('/first-forms', {
            data: payload,
            preserveScroll: true,
            onSuccess: setData({}),
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
                    <CardDescription className="text-black">
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
                        <Label>Дата проведения встречи</Label>
                        <Popover open={openDate} onOpenChange={setOpenDate}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-between font-normal"
                                    id="date_btn"
                                >
                                    {data.meeting_date
                                        ? new Date(
                                              data.meeting_date,
                                          ).toLocaleDateString()
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
                                    selected={
                                        data.meeting_date
                                            ? new Date(data.meeting_date)
                                            : undefined
                                    }
                                    captionLayout="dropdown"
                                    onSelect={(d) => {
                                        const iso = d
                                            ? d.toISOString().slice(0, 10)
                                            : null; // YYYY-MM-DD
                                        setData('meeting_date', iso);
                                        setOpenDate(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
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
                            />
                            <Input
                                placeholder="Джамоат"
                                value={data.jamoat}
                                onChange={(e) =>
                                    setData('jamoat', e.target.value)
                                }
                            />
                            <Input
                                placeholder="Село"
                                value={data.selo ?? ''}
                                onChange={(e) =>
                                    setData('selo', e.target.value)
                                }
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
                            />
                            <Input
                                required
                                min={1}
                                max={100}
                                type="number"
                                value={data.age}
                                placeholder="Возраст"
                                onInput={onAgeInput}
                            />
                            <Input
                                type="tel"
                                placeholder="Номер телефона"
                                value={data.phone}
                                maxLength={9}
                                pattern="\d{9}"
                                onInput={(e) =>
                                    setData(
                                        'phone',
                                        onlyDigits(e.currentTarget.value).slice(
                                            0,
                                            9,
                                        ),
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* 2. Семья */}
                    <div className="grid gap-3">
                        <Label>2. Общее количество членов семьи</Label>
                        <div className="gap-2 space-y-3 md:flex">
                            <Input
                                placeholder="Всего"
                                value={data.family_count}
                                onInput={(e) =>
                                    setData(
                                        'family_count',
                                        onlyDigits(e.currentTarget.value),
                                    )
                                }
                            />
                            <Input
                                placeholder="Дети"
                                value={data.children_count}
                                onInput={(e) =>
                                    setData(
                                        'children_count',
                                        onlyDigits(e.currentTarget.value),
                                    )
                                }
                            />
                            <Input
                                placeholder="Пожилые"
                                value={data.elderly_count}
                                onInput={(e) =>
                                    setData(
                                        'elderly_count',
                                        onlyDigits(e.currentTarget.value),
                                    )
                                }
                            />
                            <Input
                                placeholder="Трудоспособные"
                                value={data.able_count}
                                onInput={(e) =>
                                    setData(
                                        'able_count',
                                        onlyDigits(e.currentTarget.value),
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* 3. Доход */}
                    <div className="grid gap-3">
                        <Label>3. Основной источник дохода семьи</Label>
                        <RadioGroup
                            value={data.income}
                            onValueChange={(v) => setData('income', v)}
                            className="flex flex-col gap-3 md:flex-row"
                        >
                            {[
                                ['Сельское хозяйство', 'inc1'],
                                ['Сезонные работы', 'inc2'],
                                ['Работа за рубежом', 'inc3'],
                                ['Пенсия', 'inc4'],
                                ['Другое', 'inc5'],
                            ].map(([label, id]) => (
                                <div
                                    className="flex items-center gap-2"
                                    key={id}
                                >
                                    <RadioGroupItem value={label} id={id} />
                                    <Label htmlFor={id}>{label}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {data.income === 'Другое' && (
                            <Input
                                required
                                placeholder="Если другое — укажите"
                                onChange={(e) =>
                                    setData('income', e.target.value)
                                } // записывает конкретное значение
                            />
                        )}
                    </div>

                    {/* 4. Площадь участка */}
                    <div className="grid gap-3">
                        <Label>4. Площадь приусадебного участка (га)</Label>
                        <Input
                            placeholder="в гектарах"
                            value={data.plot_ha}
                            onInput={(e) =>
                                setData(
                                    'plot_ha',
                                    e.currentTarget.value.replace(
                                        /[^\d.,]/g,
                                        '',
                                    ),
                                )
                            }
                        />
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
                                // очистим неактуальный блок при переключении
                                if (v === 'овощеводство')
                                    setData('garden', resetMarked(data.garden));
                                if (v === 'садоводство')
                                    setData('veg', resetMarked(data.veg));
                                setData('agriculture_experience', v);
                            }}
                            className="flex flex-col gap-3 md:flex-row"
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

                    {/* 6. Овощеводство (автопоказ по опыту) */}
                    <div className="grid gap-3">
                        <Label>
                            6. Если Вы выбираете направление «Овощеводство»,
                            отметьте нужные семена и укажите площадь (га):
                        </Label>
                        {showVegetable && (
                            <>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {[
                                        ['Помидор', 'tomato'],
                                        ['Болгарский перец', 'pepper'],
                                        ['Огурец', 'cucumber'],
                                        ['Лук', 'onion'],
                                        ['Свёкла', 'beet'],
                                        ['Картофель', 'potato'],
                                        ['Другое', 'other'],
                                    ].map(([label, key]) => (
                                        <div
                                            key={key}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={`veg_${key}`}
                                                checked={data.veg[key].checked}
                                                onCheckedChange={(c) =>
                                                    setVegItem(
                                                        key as keyof Marked,
                                                        { checked: Boolean(c) },
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`veg_${key}`}
                                                className="whitespace-nowrap"
                                            >
                                                {label}
                                            </Label>
                                            <Input
                                                className="ml-auto"
                                                placeholder="га"
                                                value={data.veg[key].area}
                                                onChange={(e) =>
                                                    setVegItem(
                                                        key as keyof Marked,
                                                        {
                                                            area: e.target
                                                                .value,
                                                        },
                                                    )
                                                }
                                                disabled={
                                                    !data.veg[key].checked
                                                }
                                                required={data.veg[key].checked}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Примечание: В пакет входят сеялка,
                                    опрыскиватель, защитная спецодежда,
                                    овощеводческий инвентарь.
                                </p>
                            </>
                        )}
                    </div>

                    {/* 7. Садоводство (автопоказ по опыту) */}
                    <div className="grid gap-3">
                        <Label>
                            7. Если Вы выбираете направление «Садоводство»,
                            отметьте нужные саженцы и укажите площадь (га):
                        </Label>
                        {showGarden && (
                            <>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {[
                                        ['Абрикос', 'apricot'],
                                        ['Яблоня', 'apple'],
                                        ['Виноград', 'grape'],
                                        ['Миндаль', 'almond'],
                                        ['Хурма', 'persimmon'],
                                        ['Ягодные культуры', 'berries'],
                                        ['Другое', 'other'],
                                    ].map(([label, key]) => (
                                        <div
                                            key={key}
                                            className="flex items-center gap-2"
                                        >
                                            <Checkbox
                                                id={`garden_${key}`}
                                                checked={
                                                    data.garden[key].checked
                                                }
                                                onCheckedChange={(c) =>
                                                    setGardenItem(
                                                        key as keyof Marked,
                                                        { checked: Boolean(c) },
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor={`garden_${key}`}
                                                className="whitespace-nowrap"
                                            >
                                                {label}
                                            </Label>
                                            <Input
                                                className="ml-auto"
                                                placeholder="га"
                                                value={data.garden[key].area}
                                                onChange={(e) =>
                                                    setGardenItem(
                                                        key as keyof Marked,
                                                        {
                                                            area: e.target
                                                                .value,
                                                        },
                                                    )
                                                }
                                                disabled={
                                                    !data.garden[key].checked
                                                }
                                                required={
                                                    data.garden[key].checked
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Примечание: В пакет входят ручной
                                    опрыскиватель, защитная спецодежда, садовый
                                    инвентарь (набор).
                                </p>
                            </>
                        )}
                    </div>

                    {/* 8. Орошение */}
                    <div className="grid gap-3">
                        <Label>8. Укажите доступный источник орошения:</Label>
                        <div className="grid gap-2 md:grid-cols-4">
                            {[
                                ['Нет', 'none'],
                                ['Скважина', 'well'],
                                ['Насос', 'pump'],
                                ['Канал / река', 'canal'],
                            ].map(([label, key]) => (
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
                            <Input
                                type="number"
                                placeholder="Площадь склада (м²)"
                                value={data.storage_area_sqm}
                                onInput={(e) =>
                                    setData(
                                        'storage_area_sqm',
                                        onlyDigits(e.currentTarget.value),
                                    )
                                }
                                required
                            />
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

                <CardFooter>
                    <Button type="submit" disabled={processing}>
                        {processing ? 'Сохранение...' : 'Сохранить'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
};

export default FirstForm;
