package controllers

import (
	"news-api/service"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func NewsRecommendHandler(c *fiber.Ctx) error {
	id := c.Locals("id").(string)

	user, err := service.UserService(id)
	if err != nil {
		c.Status(fiber.ErrBadRequest.Code)
		return c.JSON(fiber.Map{
			"message": "unauthenticated",
		})
	}

	pageIndexStr := c.Query("page", "1")
	pageIndex, _ := strconv.ParseInt(pageIndexStr, 10, 64)
	data, pageNum, err := service.NewsRecommendService(user, pageIndex)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	if len(data) == 0 {
		return c.JSON(fiber.Map{
			"page_num": 0,
		})
	}

	return c.JSON(fiber.Map{
		"data":     data,
		"page_num": pageNum,
	})
}

func NewsHandlersByCategory(category string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		pageIndexStr := c.Query("page", "1")
		pageIndex, _ := strconv.ParseInt(pageIndexStr, 10, 64)
		newsArr, pageNum, err := service.NewsByCategoryService(category, pageIndex)
		if err != nil {
			return c.SendStatus(fiber.StatusInternalServerError)
		}

		return c.JSON(fiber.Map{
			"data":     newsArr,
			"page_num": pageNum,
		})
	}
}

func LikeStateHandler(c *fiber.Ctx) error {
	userID := c.Locals("id").(string)
	intUserID, _ := strconv.Atoi(userID)

	newsID := c.Query("news_id")
	intNewsID, _ := strconv.Atoi(newsID)

	state, err := service.LikeStateService(intUserID, intNewsID)
	if err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	return c.JSON(fiber.Map{
		"state": state,
	})
}

func LikeNewsHandler(c *fiber.Ctx) error {
	userID := c.Locals("id").(string)
	intUserID, _ := strconv.Atoi(userID)

	newsID := c.Query("news_id")
	intNewsID, _ := strconv.Atoi(newsID)

	action := c.Query("action")

	err := service.LikeNewsService(intUserID, intNewsID, action)
	if err != nil {
		c.Status(fiber.ErrBadRequest.Code)
		return c.JSON(fiber.Map{
			"message": err,
		})
	}

	return c.JSON(fiber.Map{
		"message": "success",
	})
}

func ClickNewsHandler(c *fiber.Ctx) error {
	userID := c.Locals("id").(string)
	intUserID, _ := strconv.Atoi(userID)

	newsID := c.Query("news_id")
	intNewsID, _ := strconv.Atoi(newsID)

	err := service.ClickNewsService(intUserID, intNewsID)
	if err != nil {
		c.Status(fiber.ErrBadRequest.Code)
		return c.JSON(fiber.Map{
			"message": err,
		})
	}

	return c.JSON(fiber.Map{
		"message": "success",
	})
}

func ColdStartHandler(c *fiber.Ctx) error {
	userID := c.Locals("id").(string)
	intUserID, _ := strconv.Atoi(userID)

	var categorys []string
	if err := c.BodyParser(&categorys); err != nil {
		return err
	}

	if err := service.ColdStartService(intUserID, categorys); err != nil {
		return c.SendStatus(fiber.StatusInternalServerError)
	}
	return c.JSON(fiber.Map{
		"message": "success",
	})
}
