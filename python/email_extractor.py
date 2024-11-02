import requests
from bs4 import BeautifulSoup
import re
import json
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urljoin, urlparse
import time

def clean_url(url):
    """Clean and normalize URL"""
    if not url:
        return ''
    
    url = url.strip().lower()
    parsed = urlparse(url)
    base_url = parsed.netloc
    if not base_url:
        base_url = url.split('/')[0]
    
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    print(f"Cleaned URL: {url}", file=sys.stderr)
    return url

def is_valid_email(email):
    """Validate email address"""
    # Basic email pattern
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    # Invalid patterns
    invalid_patterns = [
        r'\.png$',
        r'\.jpg$',
        r'\.gif$',
        r'\.jpeg$',
        r'\.webp$',
        r'example\.com',
        r'domain\.com',
        r'yourname',
        r'youremail',
        r'@2x',
        r'@\dx',
        r'@test',
        r'@sample',
        r'noreply',
        r'no-reply',
        r'donotreply'
    ]
    
    # Check if it matches basic email pattern
    if not re.match(email_pattern, email):
        return False
    
    # Check against invalid patterns
    for pattern in invalid_patterns:
        if re.search(pattern, email.lower()):
            return False
    
    # Additional validation rules
    if len(email) > 254:  # RFC 5321
        return False
    
    # Check if domain looks valid
    domain = email.split('@')[1]
    if len(domain.split('.')) < 2:
        return False
    
    return True

def find_emails_in_text(text):
    """Extract emails using multiple patterns"""
    email_patterns = [
        r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',  # Standard email
        r'mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',  # mailto: links
        r'email:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})',  # "email:" prefix
        r'contact:\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})'  # "contact:" prefix
    ]
    
    emails = set()
    for pattern in email_patterns:
        found = re.findall(pattern, text, re.IGNORECASE)
        for email in found:
            if isinstance(email, tuple):
                email = email[0]  # Handle groups in regex
            email = email.strip()
            if is_valid_email(email):
                emails.add(email.lower())
    
    return emails

def get_all_links(soup, base_url):
    """Get all relevant links from the page"""
    relevant_paths = ['contact', 'about', 'team', 'staff', 'company', 'info']
    links = set()
    
    for a in soup.find_all('a', href=True):
        href = a['href'].lower()
        if any(path in href for path in relevant_paths):
            full_url = urljoin(base_url, href)
            links.add(full_url)
    
    return links

def extract_emails_from_website(url):
    if not url:
        return set()

    url = clean_url(url)
    if not url:
        return set()

    print(f"Processing website: {url}", file=sys.stderr)
    emails = set()
    visited_urls = set()
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=20)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find emails in main page
        emails.update(find_emails_in_text(response.text))
        
        # Get all relevant links
        links_to_check = get_all_links(soup, url)
        
        # Check each relevant page
        for link in links_to_check:
            if link in visited_urls:
                continue
                
            try:
                print(f"Checking page: {link}", file=sys.stderr)
                visited_urls.add(link)
                
                response = requests.get(link, headers=headers, timeout=15)
                if response.status_code == 200:
                    found_emails = find_emails_in_text(response.text)
                    if found_emails:
                        print(f"Found emails on {link}: {found_emails}", file=sys.stderr)
                        emails.update(found_emails)
                
                time.sleep(1)
                
            except Exception as e:
                print(f"Error checking link {link}: {str(e)}", file=sys.stderr)
                continue
                
    except Exception as e:
        print(f"Error processing {url}: {str(e)}", file=sys.stderr)
    
    valid_emails = {email for email in emails if is_valid_email(email)}
    print(f"Final valid emails found for {url}: {valid_emails}", file=sys.stderr)
    return list(valid_emails)

def process_business(business):
    website = business.get('websiteLink', '').strip()
    print(f"\nProcessing business: {business.get('businessName', 'Unknown')}", file=sys.stderr)
    print(f"Website: {website}", file=sys.stderr)
    
    if website:
        emails = extract_emails_from_website(website)
        if emails:
            business['email'] = ', '.join(emails)
            print(f"Added valid emails to business: {emails}", file=sys.stderr)
    return business

def main():
    print("Starting email extraction process", file=sys.stderr)
    input_data = json.loads(sys.stdin.read())
    print(f"Received {len(input_data)} businesses to process", file=sys.stderr)
    
    results = []
    for business in input_data:
        try:
            result = process_business(business)
            results.append(result)
            print(f"Completed processing business: {result.get('businessName', 'Unknown')}", file=sys.stderr)
            time.sleep(2)
        except Exception as e:
            print(f"Error processing business: {str(e)}", file=sys.stderr)
            results.append(business)
    
    print(json.dumps(results))

if __name__ == "__main__":
    main()