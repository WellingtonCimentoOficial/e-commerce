from products.models import ProductFather
from stores.models import Store
from stores.exceptions import StoreNotFoundError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import LimitOffsetPagination
from .serializers import ProductCommentSerializer, StoreCommentSerializer
from rest_framework.response import Response
from rest_framework import status
from .models import ProductComment, StoreComment
from products.exceptions import ProductNotFoundError
from .utils import validate_data
from .exceptions import CommentNotFoundError

# Create your views here.
class CommentPagination(LimitOffsetPagination):
    PAGE_SIZE = 5
    default_limit = 5
    max_limit = 100

@api_view(['GET'])
def get_product_comments(request, pk):
    try:
        product_father = ProductFather.objects.get(id=pk)
        comments = product_father.comments.all() 

        #making a pagination
        paginator = CommentPagination()
        paginated_comments = paginator.paginate_queryset(comments, request)

        serializer = ProductCommentSerializer(paginated_comments, many=True, context={'request': request})
        
        return paginator.get_paginated_response(serializer.data)
    except:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_product_comment(request):
    try:
        product_id = request.data.get("product_id")
        comment = request.data.get("comment")
        rating = request.data.get("rating")

        # validating a data sent by front end
        validate_data(product_id, comment, rating)

        # looking for the product that will be commented
        product = ProductFather.objects.filter(id=product_id).first()

        # checking if the product exists
        if product is None:
            raise ProductNotFoundError()
        
        # saving the comment in the database
        new_comment = ProductComment.objects.create(product=product, comment=comment, rating=rating, owner=request.user)

        # serializing the data
        serializer = ProductCommentSerializer(new_comment, context={'request': request})

        return Response(serializer.data)
    
    except Exception as e:
        if hasattr(e, "detail") and hasattr(e, "status_code"):
            return Response({'error': e.detail}, status=e.status_code)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_product_comment(request, pk):
    try:
        comment = request.data.get("comment")
        rating = request.data.get("rating")

        # validating a data sent by front end
        validate_data(pk, comment, rating)
        
        # looking for the product that will be commented
        comment_found = request.user.product_comments.filter(id=pk).first()

        # checking if the product exists
        if comment_found is None:
            raise CommentNotFoundError()
        
        # updating the comment in the database
        comment_found.comment = comment
        comment_found.rating = rating
        comment_found.save()
        
        # serializing the data
        serializer = ProductCommentSerializer(comment_found, context={'request': request})

        return Response(serializer.data)
    
    except Exception as e:
        if hasattr(e, "detail") and hasattr(e, "status_code"):
            return Response({'error': e.detail}, status=e.status_code)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_product_comment(request, pk):
    try:
        # looking for the product that will be commented
        comment = request.user.product_comments.filter(id=pk).first()

        # checking if the product exists
        if comment is None:
            raise CommentNotFoundError()
        
        #deleting a comment
        comment.delete()

        return Response(status=status.HTTP_200_OK)
    
    except Exception as e:
        if hasattr(e, "detail") and hasattr(e, "status_code"):
            return Response({'error': e.detail}, status=e.status_code)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_store_comments(request, pk):
    try:
        store = Store.objects.get(id=pk)
        comments = store.comments.all() 

        #making a pagination
        paginator = CommentPagination()
        paginated_comments = paginator.paginate_queryset(comments, request)

        serializer = StoreCommentSerializer(paginated_comments, many=True, context={'request': request})
        
        return paginator.get_paginated_response(serializer.data)
    except:
        return Response(status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_store_comment(request):
    try:
        store_id = request.data.get("store_id")
        comment = request.data.get("comment")
        rating = request.data.get("rating")

        # validating a data sent by front end
        validate_data(store_id, comment, rating, is_store=True)

        # looking for the store that will be commented
        store = Store.objects.filter(id=store_id).first()

        # checking if the product exists
        if store is None:
            raise StoreNotFoundError()
        
        # saving the comment in the database
        new_comment = StoreComment.objects.create(store=store, comment=comment, rating=rating, owner=request.user)

        # serializing the data
        serializer = StoreCommentSerializer(new_comment, context={'request': request})

        return Response(serializer.data)
    
    except Exception as e:
        if hasattr(e, "detail") and hasattr(e, "status_code"):
            return Response({'error': e.detail}, status=e.status_code)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_store_comment(request, pk):
    try:
        comment = request.data.get("comment")
        rating = request.data.get("rating")

        # validating a data sent by front end
        validate_data(pk, comment, rating, is_store=True)
        
        # looking for the store that will be commented
        comment_found = request.user.store_comments.filter(id=pk).first()

        # checking if the store exists
        if comment_found is None:
            raise CommentNotFoundError()
        
        # updating the comment in the database
        comment_found.comment = comment
        comment_found.rating = rating
        comment_found.save()
        
        # serializing the data
        serializer = StoreCommentSerializer(comment_found, context={'request': request})

        return Response(serializer.data)
    
    except Exception as e:
        if hasattr(e, "detail") and hasattr(e, "status_code"):
            return Response({'error': e.detail}, status=e.status_code)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_store_comment(request, pk):
    try:
        # looking for the store that will be commented
        comment = request.user.store_comments.filter(id=pk).first()

        # checking if the store exists
        if comment is None:
            raise CommentNotFoundError()
        
        #deleting a comment
        comment.delete()

        return Response(status=status.HTTP_200_OK)
    
    except Exception as e:
        if hasattr(e, "detail") and hasattr(e, "status_code"):
            return Response({'error': e.detail}, status=e.status_code)
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
