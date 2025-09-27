<?php

namespace Database\Factories;

use App\Models\FirstForm;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Carbon\Carbon;

/**
 * @extends Factory<\App\Models\FirstForm>
 */
class FirstFormFactory extends Factory
{
    protected $model = FirstForm::class;

    public function definition(): array
    {
        $faker = $this->faker;

        // 0. meeting_date — в пределах последних 90 дней
        $meetingDate = Carbon::today()->subDays($faker->numberBetween(0, 90))->toDateString();

        // 1. адрес
        $rayon  = $faker->city();
        $jamoat = $faker->streetName();
        $selo   = $faker->boolean(80) ? $faker->streetName() : null;

        // 2. согласие
        $accept = $faker->boolean(90);

        // 3. участник
        $fullName = $faker->name();
        $age      = $faker->numberBetween(1, 100);
        $phone    = $faker->numerify('#########'); // ровно 9 цифр

        // 4. семья
        $familyTotal = $faker->numberBetween(1, 10);
        $children    = $faker->numberBetween(0, $familyTotal);
        $elderly     = $faker->numberBetween(0, max(0, $familyTotal - $children));
        $able        = max(0, $familyTotal - $children - $elderly);

        // 5. доход
        $incomeOptions = [
            'Сельское хозяйство',
            'Сезонные работы',
            'Работа за рубежом',
            'Пенсия',
            'Другое: ' . $faker->words(2, true),
        ];
        $income = Arr::random($incomeOptions);

        // 6. площадь участка
        $plotHa = $faker->boolean(85) ? $faker->randomFloat(2, 0, 20) : null;

        // 7. опыт
        $experience = Arr::random(['овощеводство', 'садоводство', 'пчеловодство', 'нет опыта']);

        // 8. семена/саженцы — только если релевантный опыт
        $seedKeys      = ['tomato','pepper','cucumber','onion','beet','potato','other'];
        $seedlingKeys  = ['apricot','apple','grape','almond','persimmon','berries','other'];

        $seeds = null;
        if ($experience === 'овощеводство' && $faker->boolean(80)) {
            $picked = $faker->randomElements($seedKeys, $faker->numberBetween(1, 4));
            $seeds = array_map(fn($k) => [
                'key'  => $k,
                'area' => (string) number_format($faker->randomFloat(2, 0.1, 2.0), 2, '.', ''),
            ], $picked);
        }

        $seedlings = null;
        if ($experience === 'садоводство' && $faker->boolean(80)) {
            $picked = $faker->randomElements($seedlingKeys, $faker->numberBetween(1, 4));
            $seedlings = array_map(fn($k) => [
                'key'  => $k,
                'area' => (string) number_format($faker->randomFloat(2, 0.1, 3.0), 2, '.', ''),
            ], $picked);
        }

        // 9. орошение — подмножество
        $irrKeys = ['none','well','pump','canal'];
        $irrigation = array_values(array_unique(
            $faker->randomElements($irrKeys, $faker->numberBetween(1, count($irrKeys)))
        ));

        // 10. пчеловодство (признак)
        $beekeeping = $experience === 'пчеловодство' ? true : $faker->boolean(20);

        // 11. склад
        $hasStorage = $faker->boolean(40);
        $storageArea = $hasStorage ? $faker->numberBetween(5, 500) : null;

        // 12. холодильная камера
        $hasRefrigerator = $faker->boolean(35);

        return [
            'user_id'                => $faker->boolean(70) ? User::factory() : null,

            'meeting_date'           => $meetingDate,

            'rayon'                  => $rayon,
            'jamoat'                 => $jamoat,
            'selo'                   => $selo,

            'accept'                 => $accept,

            'full_name'              => $fullName,
            'age'                    => $age,
            'phone'                  => $phone,

            'family_count'           => $familyTotal,
            'children_count'         => $children,
            'elderly_count'          => $elderly,
            'able_count'             => $able,

            'income'                 => $income,

            'plot_ha'                => $plotHa,

            'agriculture_experience' => $experience,

            'seeds'                  => $seeds,
            'seedlings'              => $seedlings,

            'irrigation_sources'     => $irrigation,

            'beekeeping'             => $beekeeping,

            'has_storage'            => $hasStorage,
            'storage_area_sqm'       => $storageArea,

            'has_refrigerator'       => $hasRefrigerator,
        ];
    }

    /**
     * Состояние: гарантированно релевантные семена (опыт овощеводство)
     */
    public function withSeeds(): self
    {
        return $this->state(function (array $attrs) {
            $faker = $this->faker;
            $seedKeys = ['tomato','pepper','cucumber','onion','beet','potato','other'];
            $picked = $faker->randomElements($seedKeys, $faker->numberBetween(1, 4));
            return [
                'agriculture_experience' => 'овощеводство',
                'seeds' => array_map(fn($k) => [
                    'key'  => $k,
                    'area' => (string) number_format($faker->randomFloat(2, 0.1, 2.0), 2, '.', ''),
                ], $picked),
                'seedlings' => null,
            ];
        });
    }

    /**
     * Состояние: гарантированно релевантные саженцы (опыт садоводство)
     */
    public function withSeedlings(): self
    {
        return $this->state(function (array $attrs) {
            $faker = $this->faker;
            $keys = ['apricot','apple','grape','almond','persimmon','berries','other'];
            $picked = $faker->randomElements($keys, $faker->numberBetween(1, 4));
            return [
                'agriculture_experience' => 'садоводство',
                'seedlings' => array_map(fn($k) => [
                    'key'  => $k,
                    'area' => (string) number_format($faker->randomFloat(2, 0.1, 3.0), 2, '.', ''),
                ], $picked),
                'seeds' => null,
            ];
        });
    }
}
