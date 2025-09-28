<?php

namespace Database\Factories;

use App\Models\SecondForm;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Arr;
use Carbon\Carbon;

/**
 * @extends Factory<\App\Models\SecondForm>
 */
class SecondFormFactory extends Factory
{
    protected $model = SecondForm::class;

    public function definition(): array
    {
        $faker = $this->faker;

        // 0. дата + адрес
        $meetingDate = Carbon::today()->subDays($faker->numberBetween(0, 60))->toDateString();
        $rayon  = $faker->city();
        $jamoat = $faker->streetName();
        $selo   = $faker->boolean(70) ? $faker->streetName() : null;

        // 1. согласие
        $accept = $faker->boolean(95);

        // 2. ДХ + руководитель
        $farmName        = $faker->company() . ' ДХ';
        $leaderFullName  = $faker->name();
        $leaderAge       = $faker->numberBetween(18, 80);
        $leaderPhone     = $faker->numerify('#########'); // 9 цифр

        // 3. площадь х-ва (га)
        $farmPlotHa = $faker->boolean(90) ? $faker->randomFloat(2, 0.5, 200) : null;

        // 4. опыт
        $experience = Arr::random(['овощеводство', 'садоводство', 'пчеловодство', 'нет опыта']);

        // 5. семена/саженцы (условно)
        $seedKeys     = ['tomato','pepper','cucumber','onion','beet','potato','other'];
        $seedlingKeys = ['apricot','apple','grape','almond','persimmon','berries','other'];

        $seeds = null;
        if ($experience === 'овощеводство' && $faker->boolean(80)) {
            $picked = $faker->randomElements($seedKeys, $faker->numberBetween(1, 4));
            $seeds = array_map(fn($k) => [
                'key'  => $k,
                'area' => (string) number_format($faker->randomFloat(2, 0.1, 5.0), 2, '.', ''),
            ], $picked);
        }

        $seedlings = null;
        if ($experience === 'садоводство' && $faker->boolean(80)) {
            $picked = $faker->randomElements($seedlingKeys, $faker->numberBetween(1, 4));
            $seedlings = array_map(fn($k) => [
                'key'  => $k,
                'area' => (string) number_format($faker->randomFloat(2, 0.1, 10.0), 2, '.', ''),
            ], $picked);
        }

        // 6. техника
        $equipChoices = ['freza', 'seeder', 'cultivator', 'other'];
        $equipmentChoice = Arr::random($equipChoices);
        $equipmentOther  = $equipmentChoice === 'other'
            ? $faker->randomElement(['трактор МТЗ', 'плуг', 'косилка', 'опрыскиватель'])
            : null;

        // 7. орошение
        $irrigation = array_values(array_unique(
            $faker->randomElements(['none','well','pump','canal'], $faker->numberBetween(1, 4))
        ));

        // 8. пчеловодство
        $beekeeping = $experience === 'пчеловодство' ? true : $faker->boolean(25);

        // 9. склад
        $hasStorage = $faker->boolean(50);
        $storageArea = $hasStorage ? $faker->numberBetween(10, 1500) : null;

        // 10. холодильная
        $hasRefrigerator = $faker->boolean(40);
        return [
            'user_id'                => $faker->boolean(60) ? User::factory() : null,

            'meeting_date'           => $meetingDate,
            'rayon'                  => $rayon,
            'jamoat'                 => $jamoat,
            'selo'                   => $selo,

            'accept'                 => $accept,

            'farm_name'              => $farmName,
            'leader_full_name'       => $leaderFullName,
            'leader_age'             => $leaderAge,
            'leader_phone'           => $leaderPhone,

            'farm_plot_ha'           => $farmPlotHa,

            'agriculture_experience' => $experience,

            'seeds'                  => $seeds,
            'seedlings'              => $seedlings,

            'equipment_choice'       => $equipmentChoice,
            'equipment_other_text'   => $equipmentOther,

            'irrigation_sources'     => $irrigation,

            'beekeeping'             => $beekeeping,

            'has_storage'            => $hasStorage,
            'storage_area_sqm'       => $storageArea,

            'has_refrigerator'       => $hasRefrigerator,

        ];
    }

    /** Гарантированно релевантные семена */
    public function withSeeds(): self
    {
        return $this->state(function () {
            $faker = $this->faker;
            $seedKeys = ['tomato','pepper','cucumber','onion','beet','potato','other'];
            $picked = $faker->randomElements($seedKeys, $faker->numberBetween(1, 4));

            return [
                'agriculture_experience' => 'овощеводство',
                'seeds' => array_map(fn($k) => [
                    'key'  => $k,
                    'area' => (string) number_format($faker->randomFloat(2, 0.1, 5.0), 2, '.', ''),
                ], $picked),
                'seedlings' => null,
            ];
        });
    }

    /** Гарантированно релевантные саженцы */
    public function withSeedlings(): self
    {
        return $this->state(function () {
            $faker = $this->faker;
            $keys = ['apricot','apple','grape','almond','persimmon','berries','other'];
            $picked = $faker->randomElements($keys, $faker->numberBetween(1, 4));

            return [
                'agriculture_experience' => 'садоводство',
                'seedlings' => array_map(fn($k) => [
                    'key'  => $k,
                    'area' => (string) number_format($faker->randomFloat(2, 0.1, 10.0), 2, '.', ''),
                ], $picked),
                'seeds' => null,
            ];
        });
    }
}
