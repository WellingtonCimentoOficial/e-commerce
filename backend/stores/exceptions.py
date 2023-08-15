from rest_framework.exceptions import APIException

class StoreNotFoundError(APIException):
    status_code = 400
    default_code = 'store_not_found'
    default_detail = 'Store not found'

    def __init__(self, detail=None):
        self.detail = detail or self.default_detail