"""
Geofencing service for Brahmaputra River in Kamrup Metro district
Restricts reporting to within 2km of river banks
"""
import math
from typing import Tuple, List

# Brahmaputra River course through Kamrup Metro (Guwahati)
# Points from east to west along the river
BRAHMAPUTRA_RIVER_PATH = [
    # Eastern section - Saraighat Bridge to Kachari Ghat
    (26.1855, 91.7535),  # Saraighat Bridge area
    (26.1845, 91.7485),
    (26.1830, 91.7420),
    (26.1815, 91.7360),
    (26.1800, 91.7300),  # Kachari Ghat
    
    # Central section - Uzan Bazaar to Fancy Bazaar riverfront
    (26.1790, 91.7245),
    (26.1780, 91.7190),
    (26.1770, 91.7135),
    (26.1760, 91.7080),
    (26.1750, 91.7025),  # Fancy Bazaar riverfront
    
    # Mid-western section
    (26.1740, 91.6970),
    (26.1730, 91.6915),
    (26.1720, 91.6860),
    (26.1710, 91.6805),
    (26.1700, 91.6750),
    
    # Western section - towards Pandu
    (26.1690, 91.6695),
    (26.1680, 91.6640),
    (26.1670, 91.6585),
    (26.1660, 91.6530),
    (26.1650, 91.6475),  # Pandu area
    
    # Far western section
    (26.1640, 91.6420),
    (26.1630, 91.6365),
    (26.1620, 91.6310),
]

GEOFENCE_RADIUS_METERS = 2000


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in meters using Haversine formula"""
    R = 6371000  # Earth radius in meters
    
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


def point_to_line_segment_distance(
    point_lat: float, 
    point_lon: float,
    seg_start_lat: float,
    seg_start_lon: float,
    seg_end_lat: float,
    seg_end_lon: float
) -> float:
    """
    Calculate minimum distance from a point to a line segment.
    Returns distance in meters.
    """
    # Convert to approximate Cartesian coordinates (works for small distances)
    # Using equirectangular projection approximation
    lat_mid = (seg_start_lat + seg_end_lat) / 2
    
    # Meters per degree
    meters_per_lat = 111320  # roughly constant
    meters_per_lon = 111320 * math.cos(math.radians(lat_mid))
    
    # Convert to local Cartesian
    px = (point_lon - seg_start_lon) * meters_per_lon
    py = (point_lat - seg_start_lat) * meters_per_lat
    
    dx = (seg_end_lon - seg_start_lon) * meters_per_lon
    dy = (seg_end_lat - seg_start_lat) * meters_per_lat
    
    # If segment has zero length, return distance to start point
    segment_length_sq = dx * dx + dy * dy
    if segment_length_sq == 0:
        return math.sqrt(px * px + py * py)
    
    # Project point onto line (parameterized by t)
    t = max(0, min(1, (px * dx + py * dy) / segment_length_sq))
    
    # Find closest point on segment
    closest_x = t * dx
    closest_y = t * dy
    
    # Distance from point to closest point on segment
    dist = math.sqrt((px - closest_x) ** 2 + (py - closest_y) ** 2)
    
    return dist


def is_within_brahmaputra_geofence(latitude: float, longitude: float) -> dict:
    """
    Check if coordinates are within 2km of Brahmaputra River in Kamrup Metro.
    
    Returns:
        dict with 'allowed' (bool) and 'distance' (float, nearest distance to river in meters)
    """
    min_distance = float('inf')
    
    # Check distance to each river segment
    for i in range(len(BRAHMAPUTRA_RIVER_PATH) - 1):
        seg_start = BRAHMAPUTRA_RIVER_PATH[i]
        seg_end = BRAHMAPUTRA_RIVER_PATH[i + 1]
        
        distance = point_to_line_segment_distance(
            latitude, longitude,
            seg_start[0], seg_start[1],
            seg_end[0], seg_end[1]
        )
        
        min_distance = min(min_distance, distance)
        
        # Early exit if already within geofence
        if min_distance <= GEOFENCE_RADIUS_METERS:
            return {
                'allowed': True,
                'distance': round(min_distance, 1),
                'message': f'Within geofence ({round(min_distance, 0)}m from Brahmaputra)'
            }
    
    # Not within geofence
    return {
        'allowed': False,
        'distance': round(min_distance, 1),
        'message': f'Outside geofence. Must be within 2km of Brahmaputra River (currently {round(min_distance, 0)}m away)'
    }
