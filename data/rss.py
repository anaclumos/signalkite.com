import os
from pytz import timezone
from datetime import datetime
import json
import feedgenerator
import pytz
from datetime import datetime

utc = timezone("UTC")


class CustomRssFeed(feedgenerator.Rss201rev2Feed):
    def add_root_elements(self, handler):
        super().add_root_elements(handler)
        link = f"https://hn.cho.sh/{datetime.now().astimezone(utc).replace(hour=0, minute=0, second=0, microsecond=0).strftime('%Y/%m/%d')}"
        handler.addQuickElement("origin", link)


def load_json_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def create_rss_feed(data):
    pub_date = datetime.fromtimestamp(data[0]["timestamp"], pytz.UTC)
    feed = CustomRssFeed(
        title="hn.cho.sh",
        link="https://hn.cho.sh/",
        description="Hacker News, AI-summarized.",
        language="en",
        pubdate=pub_date,
        origin="https://hn.cho.sh/{datetime.now().astimezone(utc).replace(hour=0, minute=0, second=0, microsecond=0).strftime('%Y/%m/%d')}",
    )

    for item in data:
        pub_date = datetime.fromtimestamp(item["timestamp"], pytz.UTC)
        feed.add_item(
            title=item["title"],
            link=item["url"],
            pubdate=pub_date,
            description=item["content"],
        )

    return feed.writeString("utf-8")


def generate_daily_rss():
    today = datetime.now().astimezone(utc).replace(hour=0, minute=0, second=0, microsecond=0)
    date_str = today.strftime("%Y-%m-%d")
    json_file_path = os.path.join("records", date_str, f"{date_str}.en.json")

    if not os.path.isfile(json_file_path):
        raise FileNotFoundError(f"JSON file not found: {json_file_path}")

    data = load_json_file(json_file_path)
    rss_feed = create_rss_feed(data)

    rss_file_path = os.path.join("public", "en.xml")
    with open(rss_file_path, "w", encoding="utf-8") as rss_file:
        rss_file.write(rss_feed)


if __name__ == "__main__":
    generate_daily_rss()
