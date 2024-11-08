from django.core.management.base import BaseCommand
from parcel.models import Region, Province, City  # Import from the 'parcel' app

class Command(BaseCommand):
    help = 'Import regions, provinces, and cities from JSON data'

    def handle(self, *args, **kwargs):
        data = {
            "regions": [
                {
                    "name": "Laâyoune-Sakia El Hamra",
                    "provinces": [
                        {
                            "name": "Laâyoune",
                            "cities": [
                                "Laâyoune",
                                "El Marsa",
                                "Boukraa",
                                "Dchaira",
                                "Foum El Oued"
                            ]
                        },
                        {
                            "name": "Boujdour",
                            "cities": [
                                "Boujdour",
                                "Gueltat Zemmour",
                                "Jraifia",
                                "Lamssid"
                            ]
                        },
                        {
                            "name": "Tarfaya",
                            "cities": [
                                "Tarfaya",
                                "Akhfennir",
                                "Tah",
                                "Hagounia",
                                "Daoura"
                            ]
                        },
                        {
                            "name": "Es-Semara",
                            "cities": [
                                "Es-Semara",
                                "Haouza",
                                "Tifariti",
                                "Jediriya",
                                "Amgala",
                                "Sidi Ahmed Laâroussi"
                            ]
                        }
                    ]
                },
                {
                    "name": "Dakhla-Oued Ed Dahab",
                    "provinces": [
                        {
                            "name": "Oued Ed Dahab",
                            "cities": [
                                "Bir Anzarane",
                                "Dakhla",
                                "El Argoub",
                                "Gleibat El Foula",
                                "Imlili",
                                "Mijik",
                                "Oum Dreyga"
                            ]
                        },
                        {
                            "name": "Aousserd",
                            "cities": [
                                "Aghouinite",
                                "Aousserd",
                                "Bir Gandouz",
                                "Lagouira",
                                "Tichka",
                                "Zoug"
                            ]
                        }
                    ]
                }
            ]
        }

        # Save regions, provinces, and cities
        for region_data in data['regions']:
            # Create or get Region
            region, created = Region.objects.get_or_create(name=region_data['name'])

            for province_data in region_data['provinces']:
                # Create or get Province
                province, created = Province.objects.get_or_create(
                    name=province_data['name'],
                    region=region
                )

                for city_name in province_data['cities']:
                    # Create or get City
                    City.objects.get_or_create(
                        name=city_name,
                        province=province
                    )

        self.stdout.write(self.style.SUCCESS('Data imported successfully'))
