#!/bin/bash

# Base URL and query parameters
base_url="https://workshop.autodata-group.com/w2/api/tyres"
query_params="?v=c475fc2fee6cb3aa12c5a3c966dbcd39dfe4659c&language=en-gb"
prefix="HON"
output_file="valid_vehicle_ids.txt"
response_dir="json_responses"
temp_dir="temp_responses"
log_file="enumeration_log.txt"
max_concurrent=5  # Limit concurrent requests to avoid bans

# Range of numbers to test (adjust as needed)
start_id=10000
end_id=20000

# Create directories and reset log file
mkdir -p "$response_dir" "$temp_dir"
: > "$log_file"  # Truncates log_file to empty it at the start of each run

# Headers and cookies from your curl command
headers=(
  -H "accept: application/json"
  -H "accept-language: en-US,en;q=0.9,en-GB;q=0.8,nb;q=0.7"
  -H "cache-control: no-cache"
  -H "content-type: application/json"
  -H "dnt: 1"
  -H "pragma: no-cache"
  -H "priority: u=1, i"
  -H "referer: https://workshop.autodata-group.com/w2/tyres/HON13351"
  -H "sec-ch-ua: \"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Microsoft Edge\";v=\"134\""
  -H "sec-ch-ua-mobile: ?0"
  -H "sec-ch-ua-platform: \"Windows\""
  -H "sec-fetch-dest: empty"
  -H "sec-fetch-mode: cors"
  -H "sec-fetch-site: same-origin"
  -H "user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0"
  -H "xhr-request-from: workshop"
)

cookies=(
  -b "ad_web_i_39322E34302E3139352E3230=0; has_js=1; adat=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIzNzM3MjU1IiwidW5hbWUiOiJnbmVsc29uNTU0NSIsImdpZCI6Ijc5MTk5MSIsInJpZHMiOls2XSwiaXNzIjoid29ya3Nob3AiLCJleHAiOjE3NDIzNTQzOTB9.upLqvnaOQAOJsqw0rLA4FqxncaplLXuXmCmOvydvacs; SESSd965b47fdd2684807fd560c91c3e21b6=Q7TVwJ4dSwqxdHpTE2kC1WRliezbGX543BmV-o606CA; ad_web_u_676E656C736F6E35353435=0; ad_web_g_373931393931=0; ad_web_i_39322E34302E3139352E3231=0; ad_web_i_39322E34302E3139352E3138=0; access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiZ25lbHNvbjU1NDUiLCJyb2xlcyI6WzgsMTIsMl0sImlzcyI6IndvcmtzaG9wIiwiZXhwIjoxNzQyMzQyNDI4fQ.PPYJY392PnRfGXaD4KATQaG8kUQItwmFLY6Uvq9G524; id_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIzNzM3MjU1IiwidW5hbWUiOiJnbmVsc29uNTU0NSIsImdpZCI6Ijc5MTk5MSIsImxhbmd1YWdlIjoiZW4tZ2IiLCJpc3MiOiJ3b3Jrc2hvcCIsImV4cCI6MTc0MjM1NjIyOH0.VuBRQL2Qa2SDw9m1aeCWYyCrzGU9YRbHvN6rrBsboUY"
)

# Function to process a single vehicle ID with redirect handling
process_vehicle_id() {
  local vehicle_id="$1"
  local full_url="${base_url}/${vehicle_id}${query_params}"
  local temp_file="${temp_dir}/${vehicle_id}.json"
  local header_file="${temp_dir}/${vehicle_id}_headers.txt"
  local curl_log="${temp_dir}/${vehicle_id}_curl.log"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  # Follow redirects with -L, capture final status code and response
  response=$(curl -L -s -w "%{http_code}" -o "$temp_file" --dump-header "$header_file" -v "$full_url" "${headers[@]}" "${cookies[@]}" 2> "$curl_log")
  status_code="${response: -3}"
  response_size=$(wc -c < "$temp_file")
  
  # Log basic request info
  echo "[$timestamp] Processing $vehicle_id" >> "$log_file"
  echo "[$timestamp]   Curl Verbose Output:" >> "$log_file"
  while IFS= read -r line; do
    echo "[$timestamp]     $line" >> "$log_file"
  done < "$curl_log"
  
  echo "[$timestamp]   URL: $full_url" >> "$log_file"
  echo "[$timestamp]   Final Status Code: $status_code" >> "$log_file"
  echo "[$timestamp]   Response Size: $response_size bytes" >> "$log_file"
  echo "[$timestamp]   Headers:" >> "$log_file"
  cat "$header_file" >> "$log_file"
  
  # Log response body snippet
  if [ "$response_size" -gt 0 ]; then
    echo "[$timestamp]   Response Body Snippet:" >> "$log_file"
    head -c 200 "$temp_file" >> "$log_file"
    echo "" >> "$log_file"
  fi
  
  # Check for redirect locations
  redirect_location=$(grep -i "Location:" "$header_file" | tail -1 | cut -d' ' -f2-)
  if [ -n "$redirect_location" ]; then
    echo "[$timestamp]   Redirect Location: $redirect_location" >> "$log_file"
  fi
  
  # Handle status codes and response content
  case "$status_code" in
    200)
      if grep -q "{" "$temp_file"; then
        echo "[$timestamp] $vehicle_id is valid (JSON response)" | tee -a "$log_file"
        echo "$vehicle_id" >> "$output_file"
        cp "$temp_file" "${response_dir}/${vehicle_id}.json"
        echo "[$timestamp]   Saved JSON response to ${response_dir}/${vehicle_id}.json" >> "$log_file"
      elif grep -qi "login" "$temp_file" || grep -qi "<html" "$temp_file"; then
        echo "[$timestamp] $vehicle_id redirected to a login page or HTML - auth required" | tee -a "$log_file"
      else
        echo "[$timestamp] $vehicle_id returned 200 but no JSON" | tee -a "$log_file"
      fi
      ;;
    302)
      echo "[$timestamp] $vehicle_id redirected (302) - possible auth issue" | tee -a "$log_file"
      ;;
    429)
      echo "[$timestamp] $vehicle_id hit rate limit (429) - pausing for 60s" | tee -a "$log_file"
      sleep 60
      ;;
    *)
      echo "[$timestamp] $vehicle_id failed (Status: $status_code)" | tee -a "$log_file"
      ;;
  esac
  
  # Clean up temp files
  rm "$temp_file" "$header_file" "$curl_log"
}

# Export function and variables for parallel execution
export -f process_vehicle_id
export base_url query_params output_file response_dir temp_dir log_file
export headers cookies

# Generate and shuffle list of vehicle IDs, then process in parallel
seq "$start_id" "$end_id" | while read i; do
  vehicle_id="${prefix}${i}"
  echo "$vehicle_id"
done | shuf | xargs -P "$max_concurrent" -I {} bash -c 'process_vehicle_id "{}"'

echo "Enumeration complete. Valid IDs saved to $output_file, JSON responses saved in $response_dir/, logs in $log_file"