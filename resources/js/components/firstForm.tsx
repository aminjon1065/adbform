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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ChevronDownIcon } from 'lucide-react';
import React, { useState } from 'react';

const FirstForm = () => {
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [age, setAge] = useState('');
    const [income, setIncome] = useState('');

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Анкета для проведения опроса по определению нужд
                        бенефициаров, женщин – работниц сельскохозяйственной
                        отрасли.
                    </CardTitle>
                    <CardDescription className={'text-black'}>
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
                    <div className="grid gap-3">
                        <Label htmlFor="tabs-demo-name">
                            Дата проведения встречи
                        </Label>
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    id="date"
                                    className="w-full justify-between font-normal"
                                >
                                    {date
                                        ? date.toLocaleDateString()
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
                                    selected={date}
                                    captionLayout="dropdown"
                                    onSelect={(date) => {
                                        setDate(date);
                                        setOpen(false);
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="tabs-demo-username">Адрес</Label>
                        <div className="space-y-2 space-x-2 md:flex">
                            <Input
                                id="tabs-demo-username"
                                placeholder={'Район'}
                            />
                            <Input
                                id="tabs-demo-username"
                                placeholder={'Джамоат'}
                            />
                            <Input
                                id="tabs-demo-username"
                                placeholder={'Село'}
                            />
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="accept">
                            Согласие на участие в опросе:
                        </Label>
                        <span className={'text-sm'}>
                            Я, нижеподписавшаяся, подтверждаю свою добровольную
                            готовность принять участие в данном опросе. Мои
                            ответы будут использованы исключительно для анализа
                            проекта и обработаны в обобщённой форме без указания
                            личных данных. Участие в опросе не создаёт для меня
                            никаких обязательств и не гарантирует получение
                            поддержки со стороны проекта.
                        </span>
                        <RadioGroup
                            defaultValue="1"
                            id={'accept'}
                            className={'flex'}
                        >
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="1" id="r1" />
                                <Label htmlFor="r1">Согласен(на)</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <RadioGroupItem value="0" id="r2" />
                                <Label htmlFor="r2">Не согласен(на)</Label>
                            </div>
                        </RadioGroup>
                    </div>
                    <Separator className="my-4" />
                    <div className="grid gap-3">
                        <Label htmlFor="name">
                            1. Информация об участнике опроса
                        </Label>
                        <div className="space-y-2 space-x-2 md:flex">
                            <Input id="name" placeholder={'Ф.И.О.'} />
                            <Input
                                required={true}
                                min="1"
                                max="100"
                                type="number"
                                id="age"
                                value={age}
                                placeholder={'Возраст'}
                                onInput={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) => {
                                    let value = e.target.value;
                                    if (+value > 100) value = '100';
                                    if (+value < 1 && value !== '') value = '1';
                                    setAge(value);
                                }}
                            />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="Номер телефона"
                                maxLength={9}
                                pattern="\d{9}" // валидация только цифры, ровно 9
                                onInput={(e) => {
                                    e.currentTarget.value =
                                        e.currentTarget.value.replace(
                                            /\D/g,
                                            '',
                                        ); // убираем всё кроме цифр
                                }}
                            />
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="family_count">
                            2. Общее количество членов семьи
                        </Label>
                        <div className="space-y-2 space-x-2 md:flex">
                            <Input
                                id="family_count"
                                type="number"
                                placeholder={'Количество членов семьи'}
                            />
                            <Input
                                id="family_count"
                                type="number"
                                placeholder={'Дети'}
                            />
                            <Input
                                id="family_count"
                                type="number"
                                placeholder={'Пожилые'}
                            />
                            <Input
                                id="family_count"
                                type="number"
                                placeholder={'Трудоспособные'}
                            />
                        </div>
                    </div>
                    <div className="grid gap-6">
                        <Label htmlFor="income">
                            3. Основной источник дохода семьи
                        </Label>
                        <div className="space-y-2 space-x-2 md:flex">
                            <RadioGroup
                                value={income}
                                onValueChange={setIncome}
                                className="flex flex-col gap-3 md:flex-row"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="Сельское хозяйство"
                                        id="r11"
                                    />
                                    <Label htmlFor="r11">
                                        Сельское хозяйство
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="Сезонные работы"
                                        id="r12"
                                    />
                                    <Label htmlFor="r12">Сезонные работы</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="Работа за рубежом"
                                        id="r13"
                                    />
                                    <Label htmlFor="r13">
                                        Работа за рубежом
                                    </Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="Пенсия" id="r14" />
                                    <Label htmlFor="r14">Пенсия</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="Другое" id="r15" />
                                    <Label htmlFor="r15">Другое</Label>
                                </div>
                            </RadioGroup>

                            {income === 'Другое' && (
                                <Input
                                    required
                                    placeholder="Если другое, писать сюда"
                                />
                            )}
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Label htmlFor="ga">
                            4. Площадь приусадебного участка (га)
                        </Label>
                        <div className="space-y-2 space-x-2 md:flex">
                            <Input
                                id="ga"
                                type="number"
                                placeholder={'в гектарах'}
                            />
                        </div>
                    </div>
                    <div className="grid gap-6">
                        <Label htmlFor="income">
                            5. В какой отрасли сельского хозяства у вас есть
                            опыт?
                        </Label>
                        <div className="space-y-2 space-x-2 md:flex">
                            <RadioGroup
                                value={income}
                                onValueChange={setIncome}
                                className="flex flex-col gap-3 md:flex-row"
                            >
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="в овощеводстве "
                                        id="r21"
                                    />
                                    <Label htmlFor="r21">В овощеводстве</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="в садоводстве"
                                        id="r22"
                                    />
                                    <Label htmlFor="r22">В садоводстве</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="в пчеловодстве"
                                        id="r23"
                                    />
                                    <Label htmlFor="r23">В пчеловодстве</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem
                                        value="не имею опыта"
                                        id="r24"
                                    />
                                    <Label htmlFor="r24">Не имею опыта</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button>Сохранить</Button>
                </CardFooter>
            </Card>
        </>
    );
};

export default FirstForm;
